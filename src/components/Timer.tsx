"use client";

import { useState, useEffect, useRef } from "react";

interface TimerProps {
  minutes: number;
  onExpire?: () => void;
  paused?: boolean;
}

export function Timer({ minutes, onExpire, paused = false }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (paused || secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, secondsLeft]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = (secondsLeft / (minutes * 60)) * 100;

  const isUrgent = pct < 20;
  const isWarning = pct < 40 && !isUrgent;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#1e1e3a"
            strokeWidth="2.5"
          />
          <path
            d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={isUrgent ? "#ef4444" : isWarning ? "#f59e0b" : "oklch(0.58 0.19 260)"}
            strokeWidth="2.5"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
      </div>
      <span
        className={`font-mono text-xl font-semibold tabular-nums ${
          isUrgent ? "text-red-400 animate-pulse" : isWarning ? "text-amber-400" : "text-[var(--foreground)]"
        }`}
      >
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
    </div>
  );
}
