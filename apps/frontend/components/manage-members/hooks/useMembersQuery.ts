import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useMembersQuery(slug: string) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery({
    queryKey: ["learners", slug],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}/learners`
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
