import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";

export function useAllCommunities() {
  const { fetcher } = useAuth();

  const {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery<Community[]>({
    queryKey: ["communities"],
    queryFn: async () => {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/all`,
        {
          credentials: "include",
        }
      );
      return response?.data;
    },
    enabled: true,
  });
  return {
    data: communities,
    isLoading,
    isError,
    isSuccess,
    refetch,
  };
}
