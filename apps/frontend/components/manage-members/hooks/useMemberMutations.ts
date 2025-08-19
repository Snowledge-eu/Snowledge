import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSecureApi } from "@/hooks/useSecureApi";

export function useMemberMutations(slug: string) {
  const queryClient = useQueryClient();
  const { secureMutation } = useSecureApi();

  const deleteMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}/learners/${userId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) {
        const errorMessage = res.data?.message || "Erreur lors de la suppression";
        throw new Error(errorMessage);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async ({
      userId,
      isContributor,
    }: {
      userId: number;
      isContributor: boolean;
    }) => {
      const res = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}/learners/${userId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isContributor }),
        }
      );
      if (!res.ok) {
        const errorMessage = res.data?.message || "Erreur lors de la modification du statut";
        throw new Error(errorMessage);
      }
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learners", slug] });
    },
  });

  return { deleteMutation, promoteMutation };
}
