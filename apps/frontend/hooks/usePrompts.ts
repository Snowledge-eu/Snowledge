import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/auth-context";

export interface Prompt {
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
}

export const usePrompts = () => {
  const { fetcher } = useAuth();

  return useQuery({
    queryKey: ["prompts"],
    queryFn: async (): Promise<Prompt[]> => {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis/prompts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
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
  });
};
