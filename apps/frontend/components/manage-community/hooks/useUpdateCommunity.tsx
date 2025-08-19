import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner"; // ou le toast que tu utilises
import { FormSchema } from "../../shared/community/hooks/useCommunityFormSchema";
import { useTranslations } from "next-intl";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useUpdateCommunity(
  id: number,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (data: any, variables: any) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const t = useTranslations("communityForm.toast");
  const { secureMutation } = useSecureApi();

  return useMutation({
    mutationFn: async (data: FormSchema) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...data,
          }),
        }
      );
      if (!res.ok) {
        // La réponse est déjà parsée dans le wrapper
        const errorMessage = res.data?.message || t("unknownError");
        throw new Error(errorMessage);
      }
      return res.data;
    },
    onSuccess: (data, variables) => {
      toast.success(t("success"));
      onSuccess?.(data, variables);
    },
    onError: (error: any) => {
      if (error.message.includes("already exists")) {
        toast.error(t("alreadyExists"));
      } else {
        toast.error(error.message);
      }
      onError?.(error);
    },
  });
}
