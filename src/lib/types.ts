export interface Session {
  id: string;
  candidate_name: string;
  started_at: string;
  finished_at: string | null;
  status: "in_progress" | "finished";
}

export interface RetoAttempt {
  id: string;
  session_id: string;
  reto_number: number;
  attempt_number: number;
  submitted_json: string;
  is_valid: boolean;
  submitted_at: string;
}

export interface RetoNote {
  id: string;
  session_id: string;
  reto_number: number;
  note: string;
  created_at: string;
}

export const RETO_CONFIG = {
  1: { title: "Lee la doc y construye el payload", minutes: 15 },
  2: { title: "Code review", minutes: 20 },
  3: { title: "Criterio t\u00e9cnico", minutes: 10 },
} as const;
