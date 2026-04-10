"use client";

import { useRouter } from "next/navigation";
import { RetoHeader } from "@/components/RetoHeader";
import { InterviewerNotes } from "@/components/InterviewerNotes";
import { Reto1 } from "@/components/retos/Reto1";
import { Reto2 } from "@/components/retos/Reto2";
import { Reto3 } from "@/components/retos/Reto3";
import { Button } from "@/components/ui/button";
import { RETO_CONFIG } from "@/lib/types";
import { useSession } from "@/context/SessionContext";

export default function RetoPage({ params }: { params: { numero: string } }) {
  const { numero } = params;
  const router = useRouter();
  const { session, role, finishSession } = useSession();
  const isInterviewer = role === "interviewer";
  const retoNumber = parseInt(numero, 10);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-[var(--muted-foreground)]">No hay sesión activa</p>
          <Button
            onClick={() => router.push("/")}
            className="bg-[var(--primary)] hover:opacity-90 text-white"
          >
            Ir al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (![1, 2, 3].includes(retoNumber)) {
    router.push("/reto/1");
    return null;
  }

  const config = RETO_CONFIG[retoNumber as keyof typeof RETO_CONFIG];
  const isLast = retoNumber === 3;

  const handleNext = async () => {
    if (isLast) {
      await finishSession();
      router.push("/fin");
    } else {
      router.push(`/reto/${retoNumber + 1}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <RetoHeader retoNumber={retoNumber} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="mb-6">
          <span className="text-xs font-mono text-[var(--primary)] uppercase tracking-wider">
            Reto {retoNumber} de 3
          </span>
          <h1 className="text-2xl font-semibold mt-1">{config.title}</h1>
        </div>

        {retoNumber === 1 && <Reto1 />}
        {retoNumber === 2 && <Reto2 />}
        {retoNumber === 3 && <Reto3 />}

        {isInterviewer && <InterviewerNotes retoNumber={retoNumber} />}

        <div className="flex justify-end mt-8 pb-8">
          <Button
            onClick={handleNext}
            className="bg-[var(--primary)] hover:opacity-90 text-white px-8"
          >
            {isLast ? "Finalizar entrevista" : `Siguiente reto →`}
          </Button>
        </div>
      </main>
    </div>
  );
}
