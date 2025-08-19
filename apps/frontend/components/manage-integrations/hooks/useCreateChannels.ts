import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useCreateChannels() {
  const { fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (params: {
      guildId: string;
      proposeName?: string;
      voteName?: string;
      resultName?: string;
    }) => {
      return await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/discord-bot/create-channels`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );
    },
  });
}
