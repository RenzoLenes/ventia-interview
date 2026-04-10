"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/context/SessionContext";
import { supabase } from "@/lib/supabase";
import type { RetoNote } from "@/lib/types";
import { RETO_CONFIG } from "@/lib/types";

export default function FinPage() {
  const router = useRouter();
  const { session, role, attempts, finishSession } = useSession();
  const [notes, setNotes] = useState<RetoNote[]>([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!session) return;
    // Ensure session is finished
    if (session.status !== "finished") {
      finishSession();
    }
    // Load notes
    supabase
      .from("reto_notes")
      .select()
      .eq("session_id", session.id)
      .order("reto_number")
      .then(({ data }) => {
        if (data) setNotes(data);
      });
  }, [session, finishSession]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--muted-foreground)]">No hay sesión activa</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[var(--primary)] hover:opacity-90 text-white"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-3xl px-6 py-12">
        <div className="text-center mb-10">
          <Logo size="lg" />
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center glow-violet">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold mb-2">Entrevista finalizada</h1>
          <p className="text-[var(--muted-foreground)]">
            Gracias, <span className="text-[var(--foreground)]">{session.candidate_name}</span>. La sesión ha sido registrada.
          </p>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => setShowSummary(!showSummary)}
            variant="outline"
            className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]"
          >
            {showSummary ? "Ocultar resumen" : "Ver resumen de sesión"}
          </Button>
          <Button
            onClick={() => {
              window.location.href = "/";
            }}
            className="bg-[var(--primary)] hover:opacity-90 text-white"
          >
            Nueva entrevista
          </Button>
        </div>

        {showSummary && (
          <div className="mt-8 space-y-6">
            {[1, 2, 3].map((retoNum) => {
              const retoAttempts = attempts.filter((a) => a.reto_number === retoNum);
              const retoNote = notes.find((n) => n.reto_number === retoNum);
              const config = RETO_CONFIG[retoNum as keyof typeof RETO_CONFIG];

              return (
                <div key={retoNum} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xs font-mono text-[var(--primary)] uppercase">Reto {retoNum}</span>
                    <span className="text-sm text-[var(--muted-foreground)]">{config.title}</span>
                  </div>

                  {retoAttempts.length === 0 ? (
                    <p className="text-sm text-[var(--muted-foreground)]">Sin intentos</p>
                  ) : (
                    <div className="space-y-3">
                      {retoAttempts.map((a) => (
                        <div key={a.id} className="rounded border border-[var(--border)] bg-[var(--background)] p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-[var(--muted-foreground)]">
                              Intento {a.attempt_number} — {new Date(a.submitted_at).toLocaleString()}
                            </span>
                            <Badge
                              className={
                                a.is_valid
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }
                            >
                              {a.is_valid ? "Válido" : "Inválido"}
                            </Badge>
                          </div>
                          <pre className="font-mono text-xs text-[var(--muted-foreground)] whitespace-pre-wrap break-all max-h-40 overflow-auto">
                            {a.submitted_json}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {role === "interviewer" && retoNote && retoNote.note && (
                    <div className="mt-4 rounded border border-amber-500/10 bg-amber-500/5 p-3">
                      <p className="text-xs font-medium text-amber-400 mb-1">Notas del entrevistador</p>
                      <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{retoNote.note}</p>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-xs text-[var(--muted-foreground)] text-center">
              Sesión iniciada: {new Date(session.started_at).toLocaleString()} ·
              Finalizada: {session.finished_at ? new Date(session.finished_at).toLocaleString() : "—"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
