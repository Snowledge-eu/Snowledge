"use client";

import { Button, Card, Input } from "@repo/ui";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function DisplayName() {
  const { user, fetchDataUser } = useAuth();
  const { secureMutation } = useSecureApi();
  const [pseudo, setPseudo] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Charger l'utilisateur depuis le contexte, sinon le récupérer
  useEffect(() => {
    const ensureUser = async () => {
      if (!user) {
        try {
          await fetchDataUser();
        } catch {}
      }
    };
    ensureUser();
  }, [user, fetchDataUser]);

  // Synchroniser le champ
  useEffect(() => {
    if (user?.pseudo) setPseudo(user.pseudo as string);
  }, [user]);

  const canSave = useMemo(() => pseudo && pseudo !== user?.pseudo, [pseudo, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await secureMutation(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pseudo }),
      });
      if (!res?.ok) {
        const errorMessage = res?.data?.message || "Update failed";
        throw new Error(errorMessage);
      }
      toast.success("Pseudo mis à jour");
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border rounded-lg shadow-sm">
      <div className="px-4 py-4 md:px-6">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-semibold">Pseudo</h2>
          <p className="text-sm text-muted-foreground">
            Enter your pseudo you&apos;d like to use.
          </p>
        </div>
      </div>
      <div className="px-4 pb-4 md:px-6">
        <Input value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="max-w-[317px]" />
      </div>
      <div className="py-4 px-4 md:px-6 border-t flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
        {/* <p className="text-sm text-muted-foreground">
                    Maximum allowed length is 32 characters.
                </p> */}
        <Button onClick={handleSave} disabled={!canSave || loading}>{loading ? "Saving..." : "Save"}</Button>
      </div>
    </Card>
  );
}
