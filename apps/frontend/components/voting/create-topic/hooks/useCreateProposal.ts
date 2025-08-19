import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { VoteFormValues } from "../vote-schema";
import { useTranslations } from "next-intl";
import { Proposal } from "@/types/proposal";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useCreateProposal(communitySlug: string) {
  const t = useTranslations("voting");
  const { user, fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  
  return useMutation({
    mutationFn: async (data: VoteFormValues): Promise<Proposal> => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/proposals`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            communityId: communitySlug,
            submitterId: user?.id,
          }),
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("proposal_submitted_success"));
    },
    onError: (error: any) => {
      console.log("error", error);
      toast.error(t("error_submitting_proposal"));
    },
  });
}
