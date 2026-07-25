// app/login/page.tsx
//
// Página de demonstração para a defesa de monografia.
// Reproduz visualmente o protótipo de deteção de força bruta
// descrito no Capítulo V, mas agora a correr como página real
// no domínio montestech.online, com a lógica no servidor (API route).

"use client";

import { useState, useRef } from "react";

type LogLine = { text: string; kind: "ok" | "fail" | "alert" };

export default function LoginDemoPage() {
  const [username, setUsername] = useState("Shelton Montes");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; kind: "ok" | "fail" | "locked" } | null>(null);
  const [log, setLog] = useState<LogLine[]>([
    { text: "Sistema iniciado. A aguardar tentativas de autenticação...", kind: "ok" },
  ]);
  const [stats, setStats] = useState({ total: 0, fail: 0, alert: 0 });
  const [showAlertBanner, setShowAlertBanner] = useState(false);
  const [slots, setSlots] = useState<("empty" | "fail" | "alert")[]>(Array(12).fill("empty"));
  const submitting = useRef(false);

  function pushLog(text: string, kind: LogLine["kind"]) {
    setLog((prev) => [...prev.slice(-40), { text, kind }]);
  }

  async function handleLogin() {
    if (submitting.current) return;
    submitting.current = true;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      const time = new Date().toLocaleTimeString();
      setStats((s) => ({
        total: s.total + 1,
        fail: data.ok ? s.fail : s.fail + 1,
        alert: data.alertTriggered ? s.alert + 1 : s.alert,
      }));

      setSlots((prev) => {
        const next = [...prev.slice(1), data.alertTriggered ? "alert" : data.ok ? "empty" : "fail"] as (
          | "empty"
          | "fail"
          | "alert"
        )[];
        return next;
      });

   if (data.ok) {
  pushLog(`[OK]    ${time}  user=${username}  login bem-sucedido`, "ok");
  setFeedback({ text: "✅ Acesso concedido. A redirecionar para o sistema...", kind: "ok" });
  setTimeout(() => {
    window.location.href = "/";
  }, 10000);
} else {
        pushLog(`[FALHA] ${time}  user=${username}  palavra-passe incorreta`, "fail");
        if (data.failsInWindow >= 3) {
          setFeedback({
            text: ` Conta sinalizada para revisão de segurança — ${data.failsInWindow} tentativas falhadas nesta janela.`,
            kind: "locked",
          });
        } else {
          setFeedback({
            text: ` Palavra-passe incorreta. (${data.failsInWindow} de 3 falhas nesta janela)`,
            kind: "fail",
          });
        }
      }

      if (data.alertTriggered) {
        pushLog(
          `[ALERTA]   ${data.failsInWindow} falhas em ≤60s para user=${username} — POSSÍVEL ATAQUE DE FORÇA BRUTA`,
          "alert"
        );
        setShowAlertBanner(true);
        setTimeout(() => setShowAlertBanner(false), 4000);
      }
    } finally {
      submitting.current = false;
      setPassword("");
    }
  }

  function handleReset() {
    setStats({ total: 0, fail: 0, alert: 0 });
    setSlots(Array(12).fill("empty"));
    setLog([{ text: "Sistema reiniciado. A aguardar tentativas de autenticação...", kind: "ok" }]);
    setFeedback(null);
    setShowAlertBanner(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F5F5", fontFamily: "Calibri, Arial, sans-serif", color: "#1C1C1C" }}>
      {/* Header */}
      <header
        style={{
          background: "#B71417",
          color: "white",
          padding: "18px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "5px solid #C8A84B",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 19 }}> Portal de Autenticação — Sistema Académico (Demonstração)</h1>
          <div style={{ fontSize: 12, opacity: 0.85, marginTop: 3 }}>
            Por trás deste formulário corre a mesma lógica de deteção descrita no Capítulo V da monografia
          </div>
        </div>
        <div style={{ fontSize: 12, textAlign: "right", opacity: 0.9 }}>
          Shelton Montes Maurício Montinho
          <br />
          Defesa de Monografia · USTM 2025
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 18, padding: "22px 32px" }}>
        {/* Login box */}
        <div
          style={{
            background: "white",
            borderRadius: 10,
            padding: "26px 30px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            border: "1px solid #e2e2e2",
            maxWidth: 380,
            alignSelf: "start",
          }}
        >
          <h2 style={{ margin: "0 0 4px", fontSize: 18, color: "#B71417" }}>Iniciar Sessão</h2>
          <div style={{ fontSize: 12.5, color: "#555", marginBottom: 18 }}>
            Introduza as suas credenciais para aceder ao sistema.
          </div>

          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
            Utilizador
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 14,
            }}
          />

          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#555", display: "block", marginBottom: 5 }}>
            Palavra-passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Introduza a palavra-passe"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1.5px solid #ddd",
              borderRadius: 6,
              fontSize: 14,
              marginBottom: 14,
            }}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              background: "#B71417",
              color: "white",
              border: "none",
              padding: "11px 18px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Entrar
          </button>
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              background: "#444",
              color: "white",
              border: "none",
              padding: "11px 18px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              marginTop: 10,
            }}
          >
            ↺ Reiniciar Demonstração
          </button>

          {feedback && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                background: feedback.kind === "ok" ? "#EAF6EC" : feedback.kind === "locked" ? "#fff3cd" : "#FDECEA",
                color: feedback.kind === "ok" ? "#2E7D32" : feedback.kind === "locked" ? "#7a5b00" : "#B71417",
                border: `1px solid ${feedback.kind === "ok" ? "#b9e3bf" : feedback.kind === "locked" ? "#ffe28a" : "#f5c2c0"}`,
              }}
            >
              {feedback.text}
            </div>
          )}

          <div style={{ fontSize: 11.5, color: "#999", marginTop: 16, lineHeight: 1.5, borderTop: "1px dashed #ddd", paddingTop: 12 }}>
            <b>Para a demonstração:</b> a palavra-passe correta é <b>USTM2025</b>. Tenta digitar uma palavra-passe
            errada <b>3 vezes seguidas</b> dentro de 60 segundos e observa o painel à direita — o sistema vai gerar um
            alerta automaticamente, tal como faria com um ataque de força bruta real.
          </div>
        </div>

        {/* Monitor panel */}
        <div style={{ background: "white", borderRadius: 10, padding: "18px 20px", boxShadow: "0 2px 10px rgba(0,0,0,0.08)", border: "1px solid #e2e2e2" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 14, color: "#B71417", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #B71417", paddingBottom: 8 }}>
            ⚙️ Motor de Deteção (servidor — API route)
          </h2>

          {showAlertBanner && (
            <div
              style={{
                background: "#B71417",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 12,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              🚨 ALERTA GERADO — 3 falhas em &lt;60s detetadas para este utilizador!
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { num: stats.total, lbl: "Tentativas" },
              { num: stats.fail, lbl: "Falhas" },
              { num: stats.alert, lbl: "Alertas", danger: true },
            ].map((s, i) => (
              <div key={i} style={{ background: "#F5F5F5", borderRadius: 8, padding: 10, textAlign: "center", border: "1px solid #e2e2e2" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#B71417" }}>{s.num}</div>
                <div style={{ fontSize: 10.5, color: "#555", textTransform: "uppercase", marginTop: 2 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 6 }}>{username} — janela de 60 segundos</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
            {slots.map((s, i) => (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 3,
                  background: s === "alert" ? "#B71417" : s === "fail" ? "#E65100" : "#ddd",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 10.5, color: "#999", marginBottom: 14 }}>
            cada quadrado = 1 tentativa (cinza = OK, laranja = falha, vermelho = alerta)
          </div>

          <h2 style={{ margin: "18px 0 12px", fontSize: 14, color: "#B71417", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "2px solid #B71417", paddingBottom: 8 }}>
            📄 Registo de Logs
          </h2>
          <div style={{ height: 220, overflowY: "auto", background: "#0D1117", color: "#c9d1d9", borderRadius: 8, padding: 10, fontFamily: "Consolas, monospace", fontSize: 12.5, lineHeight: 1.5 }}>
            {log.map((l, i) => (
              <div
                key={i}
                style={{
                  color: l.kind === "ok" ? "#7ee787" : l.kind === "fail" ? "#ffa657" : "#ff7b72",
                  fontWeight: l.kind === "alert" ? 700 : 400,
                  whiteSpace: "pre-wrap",
                }}
              >
                {l.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ textAlign: "center", padding: 14, fontSize: 11, color: "#999" }}>
        Universidade São Tomás de Moçambique · montestech.online · Demonstração para defesa académica
      </footer>
    </div>
  );
}
