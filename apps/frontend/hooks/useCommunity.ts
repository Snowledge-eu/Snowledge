import { useQuery } from "@tanstack/react-query";
import { Community } from "@/types/community";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "./useSecureApi";

export function useCommunity(slug: string) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery<Community>({
    queryKey: ["community", slug],
    queryFn: async () => {
      // Utilisation du hook sécurisé
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}`
      );
      return response?.data;
    },
    enabled: !!slug,
    // Retry automatique en cas d'erreur d'authentification
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false; // Ne pas retry si l'authentification échoue
      }
      return failureCount < 3; // Retry jusqu'à 3 fois pour les autres erreurs
    },
  });
}
