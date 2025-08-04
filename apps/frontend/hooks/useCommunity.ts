import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";

export function useCommunity(slug: string) {
  const { fetcher } = useAuth();

  return useQuery<Community>({
    queryKey: ["community", slug],
    queryFn: async () => {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      return response?.data;
    },
    enabled: !!slug,
  });
}
