"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSession as useAppSession } from "@/context/SessionContext";
import type { Session, RetoAttempt, RetoNote } from "@/lib/types";
import { RETO_CONFIG } from "@/lib/types";

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { role } = useAppSession();
  const [session, setSession] = useState<Session | null>(null);
  const [attempts, setAttempts] = useState<RetoAttempt[]>([]);
  const [notes, setNotes] = useState<RetoNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "interviewer") return;
    Promise.all([
      supabase.from("sessions").select().eq("id", id).single(),
      supabase.from("reto_attempts").select().eq("session_id", id).order("submitted_at"),
      supabase.from("reto_notes").select().eq("session_id", id).order("reto_number"),
    ]).then(([sessionRes, attemptsRes, notesRes]) => {
      if (sessionRes.data) setSession(sessionRes.data);
      if (attemptsRes.data) setAttempts(attemptsRes.data);
      if (notesRes.data) setNotes(notesRes.data);
      setLoading(false);
    });
  }, [id, role]);

  if (role !== "interviewer") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--muted-foreground)]">Acceso restringido</p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Sesión no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--noche)]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-5 w-px bg-[var(--border)]" />
            <Link href="/admin" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              ← Dashboard
            </Link>
          </div>
          <Badge
            className={
              session.status === "finished"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }
          >
            {session.status === "finished" ? "Finalizada" : "En progreso"}
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">{session.candidate_name}</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Inicio: {new Date(session.started_at).toLocaleString()}
            {session.finished_at && ` · Fin: ${new Date(session.finished_at).toLocaleString()}`}
          </p>
        </div>

        <div className="space-y-8">
          {[1, 2, 3].map((retoNum) => {
            const retoAttempts = attempts.filter((a) => a.reto_number === retoNum);
            const retoNote = notes.find((n) => n.reto_number === retoNum);
            const config = RETO_CONFIG[retoNum as keyof typeof RETO_CONFIG];

            return (
              <div key={retoNum} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-[var(--primary)] uppercase tracking-wider">
                    Reto {retoNum}
                  </span>
                  <span className="text-sm font-medium">{config.title}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">({config.minutes} min)</span>
                </div>

                {retoAttempts.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">Sin intentos registrados</p>
                ) : (
                  <div className="space-y-3">
                    {retoAttempts.map((a) => (
                      <div key={a.id} className="rounded border border-[var(--border)] bg-[var(--background)] p-4">
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
                        <pre className="font-mono text-xs text-[var(--muted-foreground)] whitespace-pre-wrap break-all max-h-60 overflow-auto">
                          {a.submitted_json}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}

                {retoNote && retoNote.note && (
                  <div className="mt-4 rounded border border-amber-500/10 bg-amber-500/5 p-3">
                    <p className="text-xs font-medium text-amber-400 mb-1">Notas del entrevistador</p>
                    <p className="text-sm text-[var(--muted-foreground)] whitespace-pre-wrap">{retoNote.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
