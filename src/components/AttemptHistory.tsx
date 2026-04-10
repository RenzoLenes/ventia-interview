"use client";

import { useState } from "react";
import type { RetoAttempt } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export function AttemptHistory({ attempts }: { attempts: RetoAttempt[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (attempts.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
        Intentos previos
      </p>
      {attempts.map((a, i) => (
        <div key={a.id} className="rounded border border-[var(--border)] bg-[var(--noche)]">
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm"
          >
            <span className="text-[var(--muted-foreground)]">
              Intento {a.attempt_number} — {new Date(a.submitted_at).toLocaleTimeString()}
            </span>
            <Badge
              variant={a.is_valid ? "default" : "destructive"}
              className={a.is_valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : ""}
            >
              {a.is_valid ? "Válido" : "Inválido"}
            </Badge>
          </button>
          {openIdx === i && (
            <div className="px-3 pb-3">
              <pre className="font-mono text-xs text-[var(--muted-foreground)] whitespace-pre-wrap break-all bg-[var(--background)] rounded p-2 max-h-48 overflow-auto">
                {a.submitted_json}
              </pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
