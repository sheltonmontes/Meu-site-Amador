// app/api/auth/route.ts
//
// API Route do Next.js (App Router) que implementa a deteção de força bruta
// descrita no Capítulo V da monografia: sliding window — 3 ou mais falhas
// para o mesmo utilizador em menos de 60 segundos gera um alerta.
//
// NOTA: o armazenamento em memória (Map) é apenas para demonstração.
// Para uso real seria necessário Redis, Vercel KV ou uma base de dados.

import { NextRequest, NextResponse } from "next/server";

const CORRECT_PASSWORD = "USTM2025";
const WINDOW_MS = 60_000; // 60 segundos
const FAIL_THRESHOLD = 3;
const NTFY_TOPIC = "smm-ustm-deteccao-7x9k2";

type LoginEvent = { ok: boolean; t: number; ip: string };
type UserState = { events: LoginEvent[]; failsSinceAlert: number };

// Guardado em globalThis para não ser reiniciado quando o Next.js
// recompila módulos (modo dev) — evita contadores a voltar a zero.
const g = globalThis as unknown as { __authState?: Map<string, UserState> };
const users: Map<string, UserState> = g.__authState ?? (g.__authState = new Map());

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Utilizador inválido" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "IP desconhecido";

  const now = Date.now();
  const ok = password === CORRECT_PASSWORD;

  // Estado deste utilizador
  const state: UserState = users.get(username) ?? { events: [], failsSinceAlert: 0 };

  state.events.push({ ok, t: now, ip });
  state.events = state.events.filter((e) => now - e.t <= WINDOW_MS);

  const failsInWindow = state.events.filter((e) => !e.ok).length;

  // Contador independente da janela: quantas falhas houve desde o último alerta.
  // (A versão anterior comparava com failsInWindow, que DIMINUI quando eventos
  // antigos saem da janela — isso bloqueava alertas seguintes.)
  if (!ok) state.failsSinceAlert++;
  if (failsInWindow < FAIL_THRESHOLD) state.failsSinceAlert = 0;

  let alertTriggered = false;
  let notified: boolean | null = null; // null = não houve tentativa de envio

  if (!ok && failsInWindow >= FAIL_THRESHOLD && state.failsSinceAlert >= FAIL_THRESHOLD) {
    alertTriggered = true;
    state.failsSinceAlert = 0;

    console.warn(
      `[ALERTA SEGURANÇA] ${failsInWindow} falhas em ${WINDOW_MS / 1000}s ` +
        `para user="${username}" IP="${ip}" às ${new Date(now).toISOString()}`
    );

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
          `Utilizador: ${username}\n` +
          `IP: ${ip}\n` +
          `${failsInWindow} falhas em ${WINDOW_MS / 1000}s\n` +
          `${new Date(now).toLocaleTimeString("pt-PT")}`,
        signal: AbortSignal.timeout(5000), // não deixa o pedido pendurado
      });

      // fetch NÃO lança erro em 429/500 — é preciso verificar o estado
      notified = res.ok;
      if (!res.ok) {
        console.error("ntfy recusou o envio:", res.status, await res.text());
      }
    } catch (err) {
      notified = false;
      console.error("Falha ao enviar notificacao ntfy:", err);
    }
  }

  users.set(username, state);

  return NextResponse.json({
    ok,
    username,
    ip,
    failsInWindow,
    alertTriggered,
    notified,
    totalAttempts: state.events.length,
    timestamp: now,
  });
}
