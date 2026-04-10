"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, RetoAttempt } from "@/lib/types";

interface SessionContextType {
  session: Session | null;
  attempts: RetoAttempt[];
  createSession: (candidateName: string) => Promise<Session>;
  finishSession: () => Promise<void>;
  addAttempt: (attempt: RetoAttempt) => void;
  loadSession: (id: string) => Promise<void>;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [attempts, setAttempts] = useState<RetoAttempt[]>([]);

  const createSession = useCallback(async (candidateName: string) => {
    const { data, error } = await supabase
      .from("sessions")
      .insert({ candidate_name: candidateName })
      .select()
      .single();

    if (error) throw error;
    setSession(data);
    setAttempts([]);
    return data as Session;
  }, []);

  const finishSession = useCallback(async () => {
    if (!session) return;
    const { error } = await supabase
      .from("sessions")
      .update({ status: "finished", finished_at: new Date().toISOString() })
      .eq("id", session.id);

    if (error) throw error;
    setSession((prev) => prev ? { ...prev, status: "finished", finished_at: new Date().toISOString() } : null);
  }, [session]);

  const addAttempt = useCallback((attempt: RetoAttempt) => {
    setAttempts((prev) => [...prev, attempt]);
  }, []);

  const loadSession = useCallback(async (id: string) => {
    const [sessionRes, attemptsRes] = await Promise.all([
      supabase.from("sessions").select().eq("id", id).single(),
      supabase.from("reto_attempts").select().eq("session_id", id).order("submitted_at"),
    ]);
    if (sessionRes.error) throw sessionRes.error;
    setSession(sessionRes.data);
    setAttempts(attemptsRes.data ?? []);
  }, []);

  return (
    <SessionContext.Provider value={{ session, attempts, createSession, finishSession, addAttempt, loadSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
