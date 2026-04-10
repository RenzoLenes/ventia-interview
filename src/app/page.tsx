"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/context/SessionContext";
import type { Role } from "@/context/SessionContext";

export default function Home() {
  const router = useRouter();
  const { createSession, setRole } = useSession();
  const [selectedRole, setSelectedRole] = useState<Role>("candidate");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStart = async () => {
    if (selectedRole === "candidate") {
      const trimmed = name.trim();
      if (!trimmed) {
        setError("Ingresa tu nombre");
        return;
      }
      if (!code.trim()) {
        setError("Ingresa el código de acceso");
        return;
      }
      if (code.trim().toUpperCase() !== process.env.NEXT_PUBLIC_CANDIDATE_CODE) {
        setError("Código de acceso incorrecto");
        return;
      }
      setLoading(true);
      setError("");
      try {
        await createSession(trimmed);
        setRole("candidate");
        router.push("/reto/1");
      } catch {
        setError("Error al crear la sesión. Intenta de nuevo.");
        setLoading(false);
      }
    } else {
      if (!pin.trim()) {
        setError("Ingresa el PIN");
        return;
      }
      if (!/^\d{6}$/.test(pin.trim())) {
        setError("El PIN debe ser de 6 dígitos");
        return;
      }
      if (pin.trim() !== process.env.NEXT_PUBLIC_INTERVIEWER_PIN) {
        setError("PIN incorrecto");
        return;
      }
      setRole("interviewer");
      router.push("/admin");
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
            Estoy ingresando como
          </label>
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => { setSelectedRole("candidate"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                selectedRole === "candidate"
                  ? "bg-[var(--primary)] text-white border-transparent"
                  : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              Candidato
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole("interviewer"); setError(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                selectedRole === "interviewer"
                  ? "bg-[var(--primary)] text-white border-transparent"
                  : "bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              Entrevistador
            </button>
          </div>

          {selectedRole === "candidate" ? (
            <>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                Tu nombre
              </label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setError(""); }}
                placeholder="Ej: Ana Torres"
                className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--marino)] h-12 text-base"
                autoFocus
              />
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2 mt-4">
                Código de acceso
              </label>
              <Input
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Código proporcionado por el entrevistador"
                className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--marino)] h-12 text-base uppercase"
              />
            </>
          ) : (
            <>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                PIN de acceso (6 dígitos)
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="••••••"
                className="bg-[var(--background)] border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--marino)] h-12 text-base tracking-[0.5em] text-center"
                autoFocus
              />
            </>
          )}

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
                Ingresando...
              </span>
            ) : selectedRole === "candidate" ? (
              "Iniciar entrevista"
            ) : (
              "Ingresar al panel"
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
