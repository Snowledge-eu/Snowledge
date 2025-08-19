import { useQuery } from "@tanstack/react-query";
import type { Proposal } from "@/types/proposal";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useInProgressProposals(communitySlug: string) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery<Proposal[]>({
    queryKey: ["proposals", "in-progress", communitySlug],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/proposals/in-progress`
      );
      return response?.data;
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
