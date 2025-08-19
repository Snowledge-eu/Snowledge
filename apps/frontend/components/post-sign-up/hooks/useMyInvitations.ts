import { useQuery } from "@tanstack/react-query";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useMyInvitations() {
  const { secureQuery } = useSecureApi();
  
  return useQuery({
    queryKey: ["my-invitations"],
    queryFn: async () => {
      const res = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/user/my-invitations`
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
      return res.data;
    },
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
