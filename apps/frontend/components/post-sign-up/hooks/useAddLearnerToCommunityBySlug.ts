import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type addLearnerToCommunityBySlugParams = {
  communitySlug: string;
};

export function useaddLearnerToCommunityBySlug() {
  const { user, fetcher } = useAuth();
  const { secureMutation } = useSecureApi();
  const t = useTranslations("postSignUp");

  return useMutation({
    mutationFn: async ({
      communitySlug,
    }: addLearnerToCommunityBySlugParams) => {
      const id = user?.id;
      if (!id) throw new Error("Utilisateur non authentifié");
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${communitySlug}/learners/${id}`,
        {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        }
      );
      return res;
    },
    onSuccess: () => {
      toast.success(t("success_joined"));
    },
    onError: (err: any) => {
      let errorMsg = t("error");
      try {
        const error = JSON.parse(err.message);
        errorMsg =
          error.message || error.error || error.statusCode || "Erreur inconnue";
      } catch {
        errorMsg = err.message;
      }
      toast.error(errorMsg);
    },
  });
}
