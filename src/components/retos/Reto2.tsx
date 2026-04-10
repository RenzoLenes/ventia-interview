"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttemptHistory } from "@/components/AttemptHistory";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";
import type { RetoAttempt } from "@/lib/types";

const PYTHON_CODE = `import requests
from flask import Flask, request, jsonify

app = Flask(__name__)

WHATSAPP_TOKEN = "EAABkjZ8cQ4ABOZCmN7qLfVdT9xP2wRjKsYmGpHnUvXeI3tDlQ"
PHONE_NUMBER_ID = "123456789012345"

def send_whatsapp(phone, message):
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": { "body": message }
    }
    response = requests.post(url, json=payload, headers=headers)
    return response.json()

@app.route("/webhook/order", methods=["POST"])
def handle_order():
    data = request.json
    customer = data["customer"]
    phone = customer["phone"]
    name = customer["first_name"]
    order_number = data["order_number"]
    total = data["total_price"]
    currency = data["currency"]

    message = f"Hola {name}, tu pedido #{order_number} fue confirmado. Total: {currency} {total}. ¡Gracias!"

    result = send_whatsapp(phone, message)
    return jsonify({ "status": "sent", "wa_response": result })

if __name__ == "__main__":
    app.run(debug=True)`;

const BUGS = [
  {
    title: "Token hardcodeado",
    description:
      'WHATSAPP_TOKEN está hardcodeado en el código — si llega al repo, el token queda expuesto. Debería usarse variables de entorno (os.environ.get).',
  },
  {
    title: 'Formato del teléfono con "+"',
    description:
      'phone = customer["phone"] viene como "+51987654321" pero WhatsApp API rechaza el "+". Falta hacer phone.replace("+", "") o phone.lstrip("+").',
  },
  {
    title: "Sin manejo de errores",
    description:
      "No hay manejo de errores: si WhatsApp devuelve 4xx o 5xx, el código responde igualmente con status \"sent\". Debería verificar response.status_code antes de responder.",
  },
];

function highlightPython(code: string) {
  const lines = code.split("\n");
  return lines.map((line, i) => {
    let html = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Comments
    html = html.replace(/(#.*)$/, '<span class="syntax-comment">$1</span>');
    // Strings (f-strings and regular)
    html = html.replace(/(f?"[^"]*")/g, '<span class="syntax-string">$1</span>');
    html = html.replace(/(f?'[^']*')/g, '<span class="syntax-string">$1</span>');
    // Decorators
    html = html.replace(/^(\s*@\w+.*)/, '<span class="syntax-decorator">$1</span>');
    // Keywords
    html = html.replace(
      /\b(import|from|def|return|if|else|class|True|False|None|and|or|not)\b/g,
      '<span class="syntax-keyword">$1</span>'
    );

    return (
      <div key={i} className="flex">
        <span className="select-none text-[var(--marino)] w-8 text-right mr-4 shrink-0">{i + 1}</span>
        <span dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    );
  });
}

export function Reto2() {
  const { session, role, attempts, addAttempt } = useSession();
  const [analysis, setAnalysis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showBugs, setShowBugs] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const retoAttempts = attempts.filter((a) => a.reto_number === 2);
  const attemptsLeft = 3 - retoAttempts.length;

  const handleSubmit = useCallback(async () => {
    if (!session || attemptsLeft <= 0 || !analysis.trim()) return;
    setSubmitting(true);

    const attemptNumber = retoAttempts.length + 1;
    const { data, error } = await supabase
      .from("reto_attempts")
      .insert({
        session_id: session.id,
        reto_number: 2,
        attempt_number: attemptNumber,
        submitted_json: analysis,
        is_valid: true,
      })
      .select()
      .single();

    if (!error && data) {
      addAttempt(data as RetoAttempt);
      setLastResult("Análisis enviado ✓");
      setAnalysis("");
    }
    setSubmitting(false);
  }, [session, analysis, attemptsLeft, retoAttempts.length, addAttempt]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Code */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-mono text-[var(--muted-foreground)]">webhook_handler.py</span>
        </div>
        <pre className="p-4 text-xs font-mono leading-relaxed overflow-auto max-h-[600px]">
          {highlightPython(PYTHON_CODE)}
        </pre>
      </div>

      {/* Right: Analysis */}
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              Escribe tu análisis del código
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              Intentos: {retoAttempts.length}/3
            </span>
          </div>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            disabled={attemptsLeft <= 0}
            placeholder="Describe los problemas que encuentras en este código, qué riesgos presentan y cómo los solucionarías..."
            className="code-editor w-full bg-[var(--background)] text-[var(--foreground)] p-4 min-h-[250px] border-none outline-none placeholder:text-[var(--marino)] disabled:opacity-40"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={attemptsLeft <= 0 || submitting || !analysis.trim()}
            className="bg-[var(--primary)] hover:opacity-90 text-white"
          >
            {submitting ? "Enviando..." : "Enviar análisis"}
          </Button>
          {lastResult && (
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
              {lastResult}
            </Badge>
          )}
        </div>

        <AttemptHistory attempts={retoAttempts} />

        {role === "interviewer" && (
          <div className="mt-8 border-t border-[var(--border)] pt-4">
            <button
              onClick={() => setShowBugs(!showBugs)}
              className="text-xs text-[var(--marino)] hover:text-[var(--muted-foreground)] transition-colors"
            >
              {showBugs ? "▾" : "▸"} Ver bugs plantados
            </button>
            {showBugs && (
              <div className="mt-3 space-y-3">
                {BUGS.map((bug, i) => (
                  <div key={i} className="rounded border border-amber-500/10 bg-amber-500/5 p-3">
                    <p className="text-xs font-medium text-amber-400">
                      {i + 1}. {bug.title}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {bug.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
