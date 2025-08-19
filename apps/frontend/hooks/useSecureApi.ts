import { useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { tokenValidator } from "@/utils/token-validator";

export const useSecureApi = () => {
  const { fetcher, accessToken } = useAuth();

  const secureFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      // Vérifier si le token est valide avant l'appel
      if (accessToken && !tokenValidator.isValid(accessToken)) {
        console.warn("Token invalide détecté, tentative de refresh automatique");
      }

      try {
        const response = await fetcher(url, options);
        return response;
      } catch (error) {
        // Gérer les erreurs spécifiques
        if (error instanceof Error && error.message === "Authentication failed") {
          // Rediriger vers la page de connexion si l'authentification échoue
          window.location.href = "/sign-in";
        }
        throw error;
      }
    },
    [fetcher, accessToken]
  );

  const secureMutation = useCallback(
    async (url: string, options: RequestInit = {}) => {
      return secureFetch(url, {
        ...options,
        method: options.method || "POST",
      });
    },
    [secureFetch]
  );

  const secureQuery = useCallback(
    async (url: string, options: RequestInit = {}) => {
      return secureFetch(url, {
        ...options,
        method: "GET",
      });
    },
    [secureFetch]
  );

  return {
    secureFetch,
    secureMutation,
    secureQuery,
    isTokenValid: accessToken ? tokenValidator.isValid(accessToken) : false,
  };
};
