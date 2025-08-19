import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { Channel } from "@/types/channel";

export function useListChannels(guildId: string) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();
  
  return useQuery<Channel[]>({
    queryKey: ["discord-channels", guildId],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-bot/list-channels?guildId=${encodeURIComponent(guildId)}`
      );
      return response?.data;
    },
    enabled: !!guildId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
