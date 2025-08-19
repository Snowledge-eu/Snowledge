import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/auth-context";
import { useSecureApi } from "./useSecureApi";

export interface Prompt {
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
  created_by_id?: number;
  is_public?: boolean;
  is_own?: boolean;
}

export const usePrompts = (userId: number) => {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();

  return useQuery({
    queryKey: ["prompts", userId],
    queryFn: async (): Promise<Prompt[]> => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/prompts/${userId}`
      );

      // S'assurer que la réponse est un tableau
      if (Array.isArray(response)) {
        return response;
      }

      // Si la réponse a une propriété data, l'utiliser
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback : retourner un tableau vide
      console.warn("Unexpected response format from prompts API:", response);
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
};
