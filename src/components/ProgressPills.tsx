"use client";

export function ProgressPills({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-2 rounded-full transition-all duration-300 ${
            n === current
              ? "w-10 bg-[var(--primary)] glow-violet"
              : n < current
                ? "w-6 bg-[var(--primary)] opacity-50"
                : "w-6 bg-[var(--border)]"
          }`}
        />
      ))}
    </div>
  );
}
