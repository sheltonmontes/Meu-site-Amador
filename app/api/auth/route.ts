// app/api/auth/route.ts
//
// API Route do Next.js (App Router) que implementa a mesma lógica
// de deteção de força bruta descrita no Capítulo V da monografia:
// sliding window — 3 ou mais falhas para o mesmo utilizador em
// menos de 60 segundos gera um alerta.
//
// NOTA IMPORTANTE: este armazenamento em memória (Map) é apenas para
// demonstração. Reinicia sempre que a função serverless "adormece"
// (comportamento normal do Vercel em planos gratuitos). Para uso
// real seria necessário Redis, Vercel KV, ou uma base de dados.

import { NextRequest, NextResponse } from "next/server";

const CORRECT_PASSWORD = "USTM2025";
const WINDOW_MS = 60_000; // 60 segundos
const FAIL_THRESHOLD = 3;

type LoginEvent = { 
  ok: boolean; 
  t: number; 
  ip: string;
};

// Estado em memória: username -> eventos recentes
const userWindows = new Map<string, LoginEvent[]>();

// Estado em memória: último número de falhas em que um alerta já foi emitido
const lastAlertCount = new Map<string, number>();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || typeof username !== "string") {
    return NextResponse.json({ error: "Utilizador inválido" }, { status: 400 });
  }

  // Obter IP do cliente
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "IP desconhecido";

  const now = Date.now();
  const ok = password === CORRECT_PASSWORD;

  // Atualizar a janela deslizante deste utilizador
  const events = userWindows.get(username) ?? [];

  events.push({ 
    ok, 
    t: now,
    ip
  });

  const windowEvents = events.filter((e) => now - e.t <= WINDOW_MS);

  userWindows.set(username, windowEvents);

  const failsInWindow = windowEvents.filter((e) => !e.ok).length;

  // Lógica de alerta: dispara de novo a cada +3 falhas dentro da janela
  let alertTriggered = false;

  const prevAlertCount = lastAlertCount.get(username) ?? 0;

  if (
    !ok &&
    failsInWindow >= FAIL_THRESHOLD &&
    failsInWindow - prevAlertCount >= FAIL_THRESHOLD
  ) {
    alertTriggered = true;

    lastAlertCount.set(username, failsInWindow);

    console.warn(
      `[ALERTA SEGURANÇA] ${failsInWindow} falhas em ${
        WINDOW_MS / 1000
      }s para user="${username}" IP="${ip}" às ${new Date(now).toISOString()}`
    );

    // 🔔 Notificação push real para o telemóvel via ntfy.sh
    const NTFY_TOPIC = "smm-ustm-deteccao-7x9k2";

    try {
      await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
        method: "POST",
        headers: {
          "Title": "Alerta de Seguranca - USTM",
          "Priority": "urgent",
          "Tags": "rotating_light,warning",
        },
        body: 
`Ataque de força bruta detectado!
Utilizador: ${username}
IP: ${ip}
${failsInWindow} falhas em ${WINDOW_MS / 1000}s
${new Date(now).toLocaleTimeString("pt-PT")}`,
      });

    } catch (err) {
      console.error("Falha ao enviar notificacao ntfy:", err);
    }
  }

  if (failsInWindow < FAIL_THRESHOLD) {
    lastAlertCount.set(username, 0);
  }

  return NextResponse.json({
    ok,
    username,
    ip,
    failsInWindow,
    alertTriggered,
    totalAttempts: windowEvents.length,
    timestamp: now,
  });
}
