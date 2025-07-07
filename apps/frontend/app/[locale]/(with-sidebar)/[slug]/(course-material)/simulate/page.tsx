"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { useTranslations } from "next-intl";

export default function SimulatePage() {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const parmStep = searchParams.get("step");
  const [step, setStep] = useState<"accept" | "submit">(
    (parmStep as "accept" | "submit") || "accept"
  );
  console.log("step", step);

  const t = useTranslations("simulatePage");

  // IDs des users simulés
  const users = [
    { id: "100", label: t("continueWithUser", { user: 1 }), fakeUserId: 1 },
    { id: "101", label: t("continueWithUser", { user: 2 }), fakeUserId: 2 },
    { id: "102", label: t("continueWithUser", { user: 3 }), fakeUserId: 3 },
  ];

  return (
    <div className="max-w-xl mx-auto py-12 space-y-8">
      <h1 className="text-2xl font-bold text-center mb-6">{t("title")}</h1>
      {step === "accept" && (
        <>
          <p className="text-center mb-4">{t("introAccept")}</p>
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
              {t("nextStep")}
            </Button>
          </div>
        </>
      )}
      {step === "submit" && (
        <>
          <p className="text-center mb-4">{t("introSubmit")}</p>
          <div className="flex flex-col gap-4 items-center">
            {users.map((u) => (
              <Button
                key={u.id}
                className="w-64"
                onClick={() => router.push(`/${slug}/m-submit`)}
              >
                {t("submitWork", { user: u.fakeUserId })}
              </Button>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button
              variant="secondary"
              onClick={() => router.push(`/${slug}/review`)}
            >
              {t("goToReview")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
