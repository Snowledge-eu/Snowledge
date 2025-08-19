import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { ChannelNames } from "@/types/channelNames";

export function useRenameChannels() {
  const { fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      oldNames: ChannelNames;
      newNames: ChannelNames;
    }) => {
      return await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-bot/rename-channels`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
