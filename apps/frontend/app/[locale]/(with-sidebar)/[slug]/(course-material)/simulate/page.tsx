"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";

export default function SimulatePage() {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const parmStep = searchParams.get("step");
  const [step, setStep] = useState<"accept" | "submit">(
    (parmStep as "accept" | "submit") || "accept"
  );
  console.log("step", step);

  // IDs des users simulés
  const users = [
    { id: "100", label: "Continue with user 1", fakeUserId: 1 },
    { id: "101", label: "Continue with user 2", fakeUserId: 2 },
    { id: "102", label: "Continue with user 3", fakeUserId: 3 },
  ];

  return (
    <div className="max-w-xl mx-auto py-12 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        Simulation du workflow collaboratif
      </h1>
      {step === "accept" && (
        <>
          <p className="text-center mb-4">
            Cette page permet de simuler le passage d'un utilisateur à un autre
            dans le processus de mission. Choisissez un utilisateur pour voir sa
            mission personnalisée.
          </p>
          <div className="flex flex-col gap-4 items-center">
            {users.map((u) => (
              <Button
                key={u.id}
                className="w-64"
                onClick={() => router.push(`/${slug}/m-accept/${u.id}`)}
              >
                {u.label}
              </Button>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button variant="secondary" onClick={() => setStep("submit")}>
              Passer à l'étape suivante (dépôt des travaux)
            </Button>
          </div>
        </>
      )}
      {step === "submit" && (
        <>
          <p className="text-center mb-4">
            Les utilisateurs vont maintenant déposer leur travail. Cliquez sur
            un bouton pour simuler le dépôt de chaque utilisateur.
          </p>
          <div className="flex flex-col gap-4 items-center">
            {users.map((u) => (
              <Button
                key={u.id}
                className="w-64"
                onClick={() => router.push(`/${slug}/m-submit`)}
              >
                Déposer le travail de l'utilisateur {u.fakeUserId}
              </Button>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              onClick={() => router.push(`/${slug}/review`)}
            >
              Passer à la review
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
