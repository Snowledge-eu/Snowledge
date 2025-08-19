import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { DiscordServer } from "@/types/discordServer";

export function useUpdateDiscordServer() {
  const { fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (
      params: { guildId: string } & Partial<DiscordServer>
    ) => {
      console.log("params", params);
      return await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-server/${params.guildId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
