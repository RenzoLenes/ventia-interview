"use client";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
  return (
    <span className={`${sizes[size]} font-bold tracking-tight`}>
      <span className="text-[var(--primary)]">Vent</span>
      <span className="text-[var(--foreground)]">IA</span>
    </span>
  );
}
