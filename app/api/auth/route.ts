// app/api/auth/route.ts
//
// Deteção de força bruta com janela deslizante (Capítulo V da monografia):
// a cada 3 falhas do mesmo utilizador dentro de 60 segundos gera-se um alerta
// (3.ª falha, 6.ª falha, 9.ª falha, ...) e envia-se uma notificação push (ntfy.sh).
//
// NOTA SOBRE O ESTADO (demonstração):
// Na Vercel cada pedido pode cair numa instância diferente, por isso guardar
// os contadores em memória (Map) dá resultados inconsistentes. Para esta demo
// o estado viaja num cookie do próprio browser, o que torna a contagem
// determinística em qualquer instância. Em produção o lugar certo para este
// estado seria Redis / Vercel KV / base de dados.

import { NextRequest, NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// 1. Configuração
// ─────────────────────────────────────────────────────────────

const CORRECT_PASSWORD = "USTM2025";
const WINDOW_MS = 60_000; // janela deslizante de 60 segundos
const ALERT_EVERY = 3; // um alerta a cada 3 falhas
const NTFY_TOPIC = "smm-ustm-deteccao-7x9k2";

const COOKIE_NAME = "bf_state";
const COOKIE_MAX_AGE_S = 120;
const MAX_ATTEMPTS_PER_USER = 40; // mantém o cookie pequeno

// ─────────────────────────────────────────────────────────────
// 2. Tipos
// ─────────────────────────────────────────────────────────────

// [timestamp em ms, 1 = sucesso | 0 = falha]
type Attempt = [number, 0 | 1];

type UserState = {
  a: Attempt[]; // tentativas dentro da janela
  s: number; // falhas desde o último alerta
};

type AllState = Record<string, UserState>;

// ─────────────────────────────────────────────────────────────
// 3. Estado (guardado no cookie)
// ─────────────────────────────────────────────────────────────

function loadState(req: NextRequest, now: number): AllState {
  let parsed: AllState = {};

  try {
    const raw = req.cookies.get(COOKIE_NAME)?.value;
    if (raw) parsed = JSON.parse(raw);
  } catch {
    parsed = {}; // cookie inválido: recomeça do zero
  }

  // Remove tentativas fora da janela e utilizadores sem atividade
  const clean: AllState = {};
  for (const [user, st] of Object.entries(parsed)) {
    if (!st || !Array.isArray(st.a)) continue;
    const recent = st.a.filter(([t]) => now - t <= WINDOW_MS);
    if (recent.length > 0) {
      clean[user] = { a: recent, s: Math.max(0, Number(st.s) || 0) };
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
// 4. Notificação push (ntfy.sh)
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
        `${new Date(opts.now).toLocaleTimeString("pt-PT")}`,
      signal: AbortSignal.timeout(5000),
    });

    // fetch não lança erro em 429/500, por isso verifica-se o estado
    if (!res.ok) {
      console.error("ntfy recusou o envio:", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("Falha ao enviar notificação ntfy:", err);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 5. Handler
// ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 5.1 Ler e validar o pedido
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Pedido inválido" }, { status: 400 });
  }

  const { password } = body;
  if (!body.username || typeof body.username !== "string") {
    return NextResponse.json({ error: "Utilizador inválido" }, { status: 400 });
  }
  const username = body.username.trim().slice(0, 50);

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "IP desconhecido";

  // 5.2 Registar a tentativa na janela deslizante
  const now = Date.now();
  const ok = password === CORRECT_PASSWORD;

  const all = loadState(req, now);
  const user: UserState = all[username] ?? { a: [], s: 0 };

  user.a.push([now, ok ? 1 : 0]);
  user.a = user.a.filter(([t]) => now - t <= WINDOW_MS).slice(-MAX_ATTEMPTS_PER_USER);

  const failsInWindow = user.a.filter(([, o]) => o === 0).length;

  // 5.3 Decidir se há alerta: a cada ALERT_EVERY falhas dentro da janela
  if (!ok) user.s += 1;
  user.s = Math.min(user.s, failsInWindow); // falhas fora da janela deixam de contar

  const alertTriggered = !ok && user.s >= ALERT_EVERY;
  if (alertTriggered) user.s = 0;

  all[username] = user;

  // 5.4 Enviar notificação se houve alerta
  let notified: boolean | null = null; // null = não era para notificar
  if (alertTriggered) {
    console.warn(
      `[ALERTA SEGURANÇA] ${failsInWindow} falhas em ${WINDOW_MS / 1000}s ` +
        `para user="${username}" IP="${ip}" às ${new Date(now).toISOString()}`
    );
    notified = await sendNtfy({ username, ip, fails: failsInWindow, now });
  }

  // 5.5 Responder e guardar o estado no cookie
  const res = NextResponse.json({
    ok,
    username,
    ip,
    failsInWindow,
    alertTriggered,
    notified,
    totalAttempts: user.a.length,
    timestamp: now,
  });
  saveState(res, all);
  return res;
}
