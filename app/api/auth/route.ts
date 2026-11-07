
// app/api/auth/route.ts
//
// Deteção de força bruta com janela deslizante:
// A cada 3 falhas do mesmo utilizador dentro de 60 segundos
// gera-se um alerta e envia-se uma notificação push (ntfy.sh).
//
// O estado é guardado num cookie para evitar inconsistências
// entre diferentes instâncias da Vercel.
//
// NOTA: O timestamp continua a ser guardado em UTC (Unix ms).
// A hora é convertida para Africa/Maputo apenas na apresentação.

import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// 1. Configuração
// ─────────────────────────────────────────────────────────────

const CORRECT_PASSWORD = "USTM2025";
const WINDOW_MS = 60_000;
const ALERT_EVERY = 3;
const NTFY_TOPIC = "smm-ustm-deteccao-7x9k2";

const COOKIE_NAME = "bf_state";
const COOKIE_MAX_AGE_S = 120;
const MAX_ATTEMPTS_PER_USER = 40;

// Fuso horário oficial de Moçambique
const TIME_ZONE = "Africa/Maputo";

// ─────────────────────────────────────────────────────────────
// 2. Tipos
// ─────────────────────────────────────────────────────────────

// [timestamp em ms, 1 = sucesso | 0 = falha]
type Attempt = [number, 0 | 1];

type UserState = {
  a: Attempt[];
  s: number;
};

type AllState = Record<string, UserState>;

// ─────────────────────────────────────────────────────────────
// 3. Função para formatar a hora de Moçambique
// ─────────────────────────────────────────────────────────────

function formatMaputoTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString("pt-PT", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

// ─────────────────────────────────────────────────────────────
// 4. Estado guardado no cookie
// ─────────────────────────────────────────────────────────────

function loadState(req: NextRequest, now: number): AllState {
  let parsed: AllState = {};

  try {
    const raw = req.cookies.get(COOKIE_NAME)?.value;
    if (raw) parsed = JSON.parse(raw);
  } catch {
    parsed = {};
  }

  // Remove tentativas fora da janela de 60 segundos
  const clean: AllState = {};

  for (const [user, st] of Object.entries(parsed)) {
    if (!st || !Array.isArray(st.a)) continue;

    const recent = st.a.filter(([t]) => now - t <= WINDOW_MS);

    if (recent.length > 0) {
      clean[user] = {
        a: recent,
        s: Math.max(0, Number(st.s) || 0),
      };
    }
  }

  return clean;
}

function saveState(res: NextResponse, state: AllState) {
  res.cookies.set(COOKIE_NAME, JSON.stringify(state), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE_S,
  });
}

// ─────────────────────────────────────────────────────────────
// 5. Notificação push (ntfy.sh)
// ─────────────────────────────────────────────────────────────

async function sendNtfy(opts: {
  username: string;
  ip: string;
  fails: number;
  now: number;
}): Promise<boolean> {
  try {
    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: "POST",

      headers: {
        Title: "Alerta de Seguranca - USTM",
        Priority: "urgent",
        Tags: "rotating_light,warning",
      },

      body:
        `Ataque de força bruta detectado!\n` +
        `Utilizador: ${opts.username}\n` +
        `IP: ${opts.ip}\n` +
        `${opts.fails} falhas em ${WINDOW_MS / 1000}s\n` +
        `Data e hora: ${formatMaputoTime(opts.now)}`,

      signal: AbortSignal.timeout(5000),
    });

    // Verifica se o ntfy aceitou a notificação
    if (!res.ok) {
      console.error(
        "ntfy recusou o envio:",
        res.status,
        await res.text()
      );
    }

    return res.ok;

  } catch (err) {
    console.error("Falha ao enviar notificação ntfy:", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 6. Handler principal
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {

  // 6.1 Ler e validar o pedido

  let body: {
    username?: unknown;
    password?: unknown;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Pedido inválido" },
      { status: 400 }
    );
  }

  const { password } = body;

  if (!body.username || typeof body.username !== "string") {
    return NextResponse.json(
      { error: "Utilizador inválido" },
      { status: 400 }
    );
  }

  const username = body.username.trim().slice(0, 50);

  // Identificação do IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "IP desconhecido";

  // 6.2 Registar a tentativa

  const now = Date.now();
  const ok = password === CORRECT_PASSWORD;

  const all = loadState(req, now);

  const user: UserState = all[username] ?? {
    a: [],
    s: 0,
  };

  user.a.push([now, ok ? 1 : 0]);

  // Mantém apenas as tentativas dos últimos 60 segundos
  user.a = user.a
    .filter(([t]) => now - t <= WINDOW_MS)
    .slice(-MAX_ATTEMPTS_PER_USER);

  const failsInWindow = user.a.filter(
    ([, o]) => o === 0
  ).length;

  // 6.3 Verificar se deve gerar alerta

  if (!ok) {
    user.s += 1;
  }

  user.s = Math.min(user.s, failsInWindow);

  const alertTriggered =
    !ok && user.s >= ALERT_EVERY;

  if (alertTriggered) {
    user.s = 0;
  }

  all[username] = user;

  // 6.4 Enviar notificação se houve alerta

  let notified: boolean | null = null;

  if (alertTriggered) {

    console.warn(
      `[ALERTA SEGURANÇA] ${failsInWindow} falhas em ` +
      `${WINDOW_MS / 1000}s para user="${username}" ` +
      `IP="${ip}" às ${new Date(now).toISOString()}`
    );

    notified = await sendNtfy({
      username,
      ip,
      fails: failsInWindow,
      now,
    });
  }

  // 6.5 Responder ao pedido e guardar estado

  const res = NextResponse.json({
    ok,
    username,
    ip,
    failsInWindow,
    alertTriggered,
    notified,
    totalAttempts: user.a.length,

    // Mantém o timestamp original em milissegundos.
    // A apresentação deve converter para Africa/Maputo.
    timestamp: now,
  });

  saveState(res, all);

  return res;
}
