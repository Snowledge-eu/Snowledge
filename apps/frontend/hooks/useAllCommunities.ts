import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "./useSecureApi";

export function useAllCommunities() {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  const {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/all`
      );
      return response?.data;
    },
    enabled: true,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
  return {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  };
}
