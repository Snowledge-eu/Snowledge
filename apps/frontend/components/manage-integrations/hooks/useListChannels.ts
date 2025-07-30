import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Channel } from "@/types/channel";

export function useListChannels(guildId: string) {
  const { fetcher } = useAuth();
  return useQuery<Channel[]>({
    queryKey: ["discord-channels", guildId],
    queryFn: async () => {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-bot/list-channels?guildId=${encodeURIComponent(guildId)}`
      );
      return response?.data;
    },
    enabled: !!guildId,
  });
}
