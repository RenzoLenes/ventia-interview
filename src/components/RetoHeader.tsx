"use client";

import { Logo } from "./Logo";
import { Timer } from "./Timer";
import { ProgressPills } from "./ProgressPills";
import { RETO_CONFIG } from "@/lib/types";
import { useSession } from "@/context/SessionContext";

interface RetoHeaderProps {
  retoNumber: number;
  onTimerExpire?: () => void;
}

export function RetoHeader({ retoNumber, onTimerExpire }: RetoHeaderProps) {
  const { session } = useSession();
  const config = RETO_CONFIG[retoNumber as keyof typeof RETO_CONFIG];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#0a0a14]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Logo size="sm" />
          <div className="h-6 w-px bg-[var(--border)]" />
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">Candidato</p>
            <p className="font-medium">{session?.candidate_name ?? "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ProgressPills current={retoNumber} />
          <div className="h-6 w-px bg-[var(--border)]" />
          <Timer minutes={config.minutes} onExpire={onTimerExpire} />
        </div>
      </div>
    </header>
  );
}
