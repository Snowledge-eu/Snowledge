import { useMutation } from "@tanstack/react-query";
import { DiscordServer } from "@/types/discordServer";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useCreateDiscordServer() {
  // Pas utilisé pour l'instant
  const { fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (params: Omit<DiscordServer, "id">) => {
      return await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-server`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
