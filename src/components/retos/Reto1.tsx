"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttemptHistory } from "@/components/AttemptHistory";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";
import type { RetoAttempt } from "@/lib/types";

const SHOPIFY_PAYLOAD = `{
  "id": 820982911946154500,
  "email": "ana.torres@gmail.com",
  "created_at": "2024-01-15T10:30:00-05:00",
  "total_price": "299.00",
  "currency": "PEN",
  "order_number": 1234,
  "customer": {
    "id": 207119551,
    "first_name": "Ana",
    "last_name": "Torres",
    "phone": "+51987654321"
  },
  "line_items": [
    {
      "id": 866550311766439000,
      "name": "Zapatilla Running X",
      "quantity": 1,
      "price": "299.00"
    }
  ],
  "shipping_address": {
    "address1": "Av. Javier Prado 1234",
    "city": "Lima",
    "country": "Peru"
  }
}`;

const WHATSAPP_DOC = `Endpoint: POST https://graph.facebook.com/v18.0/{phone_number_id}/messages

Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Campos del body:
  messaging_product  string    Requerido. Siempre "whatsapp"
  to                 string    Requerido. Número en formato internacional sin "+" (ej: 51987654321)
  type               string    Requerido. "text" | "template" | "image"
  text               object    Requerido si type es "text"
  └ body             string    Contenido del mensaje. Máx 4096 caracteres.

Respuesta exitosa (200):
  { "messages": [{ "id": "wamid.xxx" }] }

Error común (400):
  Si "to" incluye el símbolo "+", la API lo rechaza.`;

export function Reto1() {
  const { session, attempts, addAttempt } = useSession();
  const [code, setCode] = useState("");
  const [webhookFired, setWebhookFired] = useState(false);
  const [webhookLines, setWebhookLines] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ valid: boolean; message: string } | null>(null);

  const retoAttempts = attempts.filter((a) => a.reto_number === 1);
  const attemptsLeft = 3 - retoAttempts.length;

  const fireWebhook = useCallback(() => {
    setWebhookFired(true);
    setWebhookLines([]);
    const lines = SHOPIFY_PAYLOAD.split("\n");
    lines.forEach((line, i) => {
      setTimeout(() => {
        setWebhookLines((prev) => [...prev, line]);
      }, i * 40);
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!session || attemptsLeft <= 0 || !code.trim()) return;
    setSubmitting(true);

    let isValid = false;
    let validationMessage = "";
    try {
      const parsed = JSON.parse(code);

      if (parsed.messaging_product !== "whatsapp") {
        validationMessage = 'messaging_product debe ser "whatsapp"';
      } else if (typeof parsed.to !== "string" || !parsed.to) {
        validationMessage = '"to" es requerido y debe ser un string';
      } else if (parsed.to.includes("+")) {
        validationMessage = '"to" no debe incluir el símbolo "+"';
      } else if (!["text", "template", "image"].includes(parsed.type)) {
        validationMessage = '"type" debe ser "text", "template" o "image"';
      } else if (parsed.type === "text") {
        if (!parsed.text || typeof parsed.text.body !== "string" || !parsed.text.body) {
          validationMessage = 'Si type es "text", se requiere text.body';
        } else if (parsed.text.body.length > 4096) {
          validationMessage = "text.body excede los 4096 caracteres";
        } else {
          isValid = true;
        }
      } else {
        isValid = true;
      }
    } catch {
      validationMessage = "JSON inválido — revisa la sintaxis";
    }

    const attemptNumber = retoAttempts.length + 1;
    const { data, error } = await supabase
      .from("reto_attempts")
      .insert({
        session_id: session.id,
        reto_number: 1,
        attempt_number: attemptNumber,
        submitted_json: code,
        is_valid: isValid,
      })
      .select()
      .single();

    if (error) {
      setLastResult({ valid: false, message: "Error al guardar el intento" });
    } else if (data) {
      addAttempt(data as RetoAttempt);
      setLastResult({
        valid: isValid,
        message: isValid ? "Payload válido ✓" : validationMessage,
      });
      if (isValid) setCode("");
    }
    setSubmitting(false);
  }, [session, code, attemptsLeft, retoAttempts.length, addAttempt]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Reference docs */}
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono text-[var(--muted-foreground)]">shopify_webhook_payload.json</span>
          </div>
          <pre className="p-4 text-xs font-mono text-[var(--muted-foreground)] overflow-auto max-h-[350px] leading-relaxed">
            {SHOPIFY_PAYLOAD}
          </pre>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-xs font-mono text-[var(--muted-foreground)]">whatsapp_cloud_api_docs.txt</span>
          </div>
          <pre className="p-4 text-xs font-mono text-[var(--muted-foreground)] overflow-auto max-h-[300px] leading-relaxed whitespace-pre-wrap">
            {WHATSAPP_DOC}
          </pre>
        </div>

        {/* Webhook simulator */}
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--noche)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
              Simulador de webhook
            </span>
            <Button
              onClick={fireWebhook}
              variant="outline"
              size="sm"
              className="border-[var(--primary)]/30 text-[var(--primary)] hover:bg-[var(--primary)]/10 text-xs"
            >
              Disparar webhook de prueba
            </Button>
          </div>
          {webhookFired && (
            <div className="bg-[var(--background)] rounded p-3 font-mono text-xs max-h-[250px] overflow-auto">
              <p className="text-emerald-400 mb-1">→ POST /webhook/order recibido</p>
              {webhookLines.map((line, i) => (
                <div
                  key={i}
                  className="animate-terminal-line text-[var(--muted-foreground)]"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {line}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="space-y-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
          <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              Construye el payload que enviarías a WhatsApp
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              Intentos: {retoAttempts.length}/3
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={attemptsLeft <= 0}
            placeholder='{\n  "messaging_product": "whatsapp",\n  ...\n}'
            className="code-editor w-full bg-[var(--background)] text-[var(--foreground)] p-4 min-h-[300px] border-none outline-none placeholder:text-[var(--marino)] disabled:opacity-40"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={attemptsLeft <= 0 || submitting || !code.trim()}
            className="bg-[var(--primary)] hover:opacity-90 text-white"
          >
            {submitting ? "Enviando..." : "Enviar intento"}
          </Button>
          {lastResult && (
            <Badge
              className={
                lastResult.valid
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }
            >
              {lastResult.message}
            </Badge>
          )}
        </div>

        <AttemptHistory attempts={retoAttempts} />
      </div>
    </div>
  );
}
