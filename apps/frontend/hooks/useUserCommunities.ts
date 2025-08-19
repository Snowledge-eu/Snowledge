import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "./useSecureApi";

export function useUserCommunities(userId: number) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery<Community[]>({
    queryKey: ["communities", userId],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/all/${userId}`
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
