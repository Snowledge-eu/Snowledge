import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { DiscordServer } from "@/types/discordServer";

export function useDiscordServer(communityId: number) {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();
  
  return useQuery<DiscordServer>({
    queryKey: ["discord-server", communityId],
    queryFn: async () => {
      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-server/by-community/${communityId}`
      );
      const data = response?.data;
      // On suppose qu'il n'y a qu'un mapping par communauté (sinon, prendre le premier)
      return Array.isArray(data) ? data[0] : data;
    },
    enabled: !!communityId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });
}
