import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoteFormValues } from "../vote-schema";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useVote(communitySlug: string) {
  const { fetcher } = useAuth();
  const { secureMutation } = useSecureApi();

  const t = useTranslations("voting");
  return useMutation({
    mutationFn: async (data: VoteFormValues) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/votes/${data.proposalId}`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("vote_submitted_success"));
    },
    onError: (error: any) => {
      toast.error(t("error_submitting_vote " + error.message));
    },
  });
}
