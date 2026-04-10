"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";
import type { Session } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const { role } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role !== "interviewer") return;

    supabase
      .from("sessions")
      .select()
      .order("started_at", { ascending: false })
      .then(({ data }) => {
        if (data) setSessions(data);
        setLoading(false);
      });
  }, [role]);

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

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)] bg-[var(--noche)]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <div className="h-5 w-px bg-[var(--border)]" />
            <span className="text-sm text-[var(--muted-foreground)]">Dashboard</span>
          </div>
          <Link href="/" className="text-xs text-[var(--primary)] hover:underline">
            Nueva entrevista
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-xl font-semibold mb-6">Sesiones de entrevista</h1>

        {loading ? (
          <p className="text-[var(--muted-foreground)] text-sm">Cargando...</p>
        ) : sessions.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-12 text-center">
            <p className="text-[var(--muted-foreground)]">No hay sesiones registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className="block rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 hover:border-[var(--primary)]/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{s.candidate_name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {new Date(s.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      s.status === "finished"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }
                  >
                    {s.status === "finished" ? "Finalizada" : "En progreso"}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
