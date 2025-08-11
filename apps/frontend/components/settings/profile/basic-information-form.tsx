"use client";

import { 
  Button, 
  Label,
  Input,
} from "@repo/ui";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


export default function BasicInformationForm() {
  const { user, fetchDataUser, fetcher } = useAuth();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const ensureUser = async () => {
      if (!user) {
        try { await fetchDataUser(); } catch {}
      }
    };
    ensureUser();
  }, [user, fetchDataUser]);

  useEffect(() => {
    if (user) {
      setFirstname(user.firstname ?? "");
      setLastname(user.lastname ?? "");
      setEmail(user.email ?? "");
    }
  }, [user]);

  const canSave = useMemo(() => (
    (!!firstname && firstname !== user?.firstname) ||
    (!!lastname && lastname !== user?.lastname) ||
    (!!email && email !== user?.email)
  ), [firstname, lastname, email, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload: Record<string, string> = {};
      if (firstname !== user?.firstname) payload.firstname = firstname;
      if (lastname !== user?.lastname) payload.lastname = lastname;
      if (email !== user?.email) payload.email = email;

      const res = await fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res?.ok) throw new Error("Update failed");
      toast.success("Informations mises à jour");
      // Optionnel: recharger les données utilisateur
      try { await fetchDataUser(); } catch {}
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="firstname">First name</Label>
        <Input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastname">Last name</Label>
        <Input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={!canSave || loading}>{loading ? "Saving..." : "Save"}</Button>
    </div>
  );
}
