import { useMutation } from "@tanstack/react-query";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useDeclineInvitation() {
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (communitySlug: string) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/learners/decline-invitation`
      );
      if (!res.ok) {
        const errorMessage = res.data?.message || "Erreur lors du refus";
        throw new Error(errorMessage);
      }
      return res.data;
    },
  });
}
