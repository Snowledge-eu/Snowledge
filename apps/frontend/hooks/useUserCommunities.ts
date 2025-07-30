import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";

export function useUserCommunities(userId: number) {
  const { fetcher } = useAuth();

  return useQuery<Community[]>({
    queryKey: ["communities", userId],
    queryFn: async () => {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/all/${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response?.data;
    },
    enabled: !!userId,
  });
}
