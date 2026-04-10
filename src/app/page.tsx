"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/context/SessionContext";

export default function Home() {
  const router = useRouter();
  const { createSession } = useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Ingresa el nombre del candidato");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createSession(trimmed);
      router.push("/reto/1");
    } catch {
      setError("Error al crear la sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-10">
          <Logo size="lg" />
          <p className="mt-3 text-[var(--muted-foreground)] text-sm tracking-wide">
            Plataforma de entrevistas técnicas
          </p>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 glow-violet">
          <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
            Nombre del candidato
          </label>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            placeholder="Ej: Ana Torres"
            className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--marino)] h-12 text-base"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

          <Button
            onClick={handleStart}
            disabled={loading}
            className="w-full mt-6 h-12 bg-[var(--primary)] hover:opacity-90 text-white font-medium text-base transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creando sesión...
              </span>
            ) : (
              "Iniciar entrevista"
            )}
          </Button>
        </div>

        <p className="text-center text-xs text-[var(--marino)] mt-8">
          3 retos · ~45 min · fullstack
        </p>
      </div>
    </div>
  );
}
