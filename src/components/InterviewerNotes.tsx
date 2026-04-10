"use client";

import { useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/context/SessionContext";

interface InterviewerNotesProps {
  retoNumber: number;
}

export function InterviewerNotes({ retoNumber }: InterviewerNotesProps) {
  const { session } = useSession();
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveNote = useCallback(async () => {
    if (!session) return;
    const { error } = await supabase
      .from("reto_notes")
      .upsert(
        { session_id: session.id, reto_number: retoNumber, note },
        { onConflict: "session_id,reto_number" }
      );
    if (!error) {
      setSaved(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setSaved(false), 2000);
    }
  }, [session, retoNumber, note]);

  return (
    <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--noche)] p-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
          Notas internas (no visibles al candidato)
        </label>
        {saved && (
          <span className="text-xs text-emerald-400 animate-terminal-line">Guardado</span>
        )}
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={saveNote}
        placeholder="Escribe observaciones sobre el desempeño del candidato..."
        className="w-full bg-transparent border-none outline-none text-sm text-[var(--muted-foreground)] placeholder:text-[var(--marino)] resize-y min-h-[80px]"
      />
    </div>
  );
}
