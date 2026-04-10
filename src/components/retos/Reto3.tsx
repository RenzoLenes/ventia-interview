"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AttemptHistory } from "@/components/AttemptHistory";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";
import type { RetoAttempt } from "@/lib/types";

const QUESTION = `El cliente nos pide que el bot también funcione si el usuario escribe el número de pedido con errores: en minúsculas, con espacios, o sin el símbolo #. Por ejemplo, que 'pedido 1234', '#1234' y '1234' todos funcionen igual. ¿Lo implementas? ¿Cómo? ¿O le dices algo al cliente primero?`;

export function Reto3() {
  const { session, attempts, addAttempt } = useSession();
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const retoAttempts = attempts.filter((a) => a.reto_number === 3);
  const attemptsLeft = 3 - retoAttempts.length;

  const handleSubmit = useCallback(async () => {
    if (!session || attemptsLeft <= 0 || !response.trim()) return;
    setSubmitting(true);

    const attemptNumber = retoAttempts.length + 1;
    const { data, error } = await supabase
      .from("reto_attempts")
      .insert({
        session_id: session.id,
        reto_number: 3,
        attempt_number: attemptNumber,
        submitted_json: response,
        is_valid: true,
      })
      .select()
      .single();

    if (error) {
      setLastResult("Error al guardar el intento");
    } else if (data) {
      addAttempt(data as RetoAttempt);
      setLastResult("Respuesta enviada ✓");
      setResponse("");
    }
    setSubmitting(false);
  }, [session, response, attemptsLeft, retoAttempts.length, addAttempt]);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Question */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 glow-violet">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
          <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase tracking-wider">
            Pregunta de criterio técnico
          </span>
        </div>
        <p className="text-lg leading-relaxed text-[var(--foreground)]">
          {QUESTION}
        </p>
      </div>

      {/* Response area */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="px-4 py-2 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--muted-foreground)]">Tu respuesta</span>
          <span className="text-xs text-[var(--muted-foreground)]">
            Intentos: {retoAttempts.length}/3
          </span>
        </div>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          disabled={attemptsLeft <= 0}
          placeholder="Explica tu razonamiento: ¿lo implementas directamente? ¿qué le preguntas al cliente? ¿cómo lo harías técnicamente?"
          className="code-editor w-full bg-[var(--background)] text-[var(--foreground)] p-4 min-h-[250px] border-none outline-none placeholder:text-[var(--marino)] disabled:opacity-40"
          spellCheck={false}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={attemptsLeft <= 0 || submitting || !response.trim()}
          className="bg-[var(--primary)] hover:opacity-90 text-white"
        >
          {submitting ? "Enviando..." : "Enviar respuesta"}
        </Button>
        {lastResult && (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
            {lastResult}
          </Badge>
        )}
      </div>

      <AttemptHistory attempts={retoAttempts} />
    </div>
  );
}
