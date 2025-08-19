"use client";

import { 
  Button, 
  Label,
  Input,
} from "@repo/ui";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { useState } from "react";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const { secureMutation } = useSecureApi();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSave = currentPassword && newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation côté client
      if (newPassword.length < 8) {
        toast.error("Le nouveau mot de passe doit contenir au moins 8 caractères");
        return;
      }
      
      const res = await secureMutation(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/change-password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      
      if (!res?.ok) {
        if (res?.status === 400) {
          throw new Error("Mot de passe actuel incorrect");
        } else {
          const errorMessage = res?.data?.message || "Erreur lors de la mise à jour du mot de passe";
          throw new Error(errorMessage);
        }
      }
      
      toast.success("Mot de passe mis à jour");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      toast.error(e?.message || "Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-span-8 lg:col-span-4 space-y-4 md:space-y-6">
      <div className="space-y-2">
        <Label htmlFor="current-password">Verify current password</Label>
        <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm password</Label>
        <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>
      <Button onClick={handleSave} disabled={!canSave || loading}>{loading ? "Saving..." : "Save"}</Button>
    </div>
  );
}
