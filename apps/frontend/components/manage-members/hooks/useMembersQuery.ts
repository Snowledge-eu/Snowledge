import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

export function useMembersQuery(slug: string) {
  const { fetcher } = useAuth();

  return useQuery({
    queryKey: ["learners", slug],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}/learners`,
        { credentials: "include" }
      );
      return res;
    },
  });
}
