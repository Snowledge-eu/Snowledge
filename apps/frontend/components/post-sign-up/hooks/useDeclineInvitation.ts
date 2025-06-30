import { useMutation } from "@tanstack/react-query";

export function useDeclineInvitation() {
  return useMutation({
    mutationFn: async (communitySlug: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/learners/decline-invitation`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Erreur lors du refus");
      return res.json();
    },
  });
}
