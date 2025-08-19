import { useMutation } from "@tanstack/react-query";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useAcceptInvitation() {
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (communitySlug: string) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/learners/accept-invitation`
      );
      if (!res.ok) {
        const errorMessage = res.data?.message || "Erreur lors de l'acceptation";
        throw new Error(errorMessage);
      }
      return res.data;
    },
  });
}
