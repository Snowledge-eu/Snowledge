import { useQuery } from "@tanstack/react-query";
import type { Vote } from "@/types/vote";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useUserVotes(communitySlug: string, userId?: string) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery<Vote[]>({
    queryKey: ["votes", userId, communitySlug],
    queryFn: async () => {
      if (!userId) return [];
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/votes`
      );
      return response?.data;
    },
    enabled: !!userId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
