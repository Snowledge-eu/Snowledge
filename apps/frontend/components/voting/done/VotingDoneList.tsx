import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import type { Proposal } from "@/types/proposal";
import VotingDoneCard from "./VotingDoneCard";
import { useAuth } from "@/contexts/auth-context";

const VotingDoneList = ({ communitySlug }: { communitySlug: string }) => {
  const { fetcher } = useAuth();

  const t = useTranslations("voting");
  const {
    data: proposals,
    isLoading,
    isError,
  } = useQuery<Proposal[]>({
    queryKey: ["proposals", "done"],
    queryFn: async () => {
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/communities/${communitySlug}/proposals`,
        { credentials: "include" }
      );
      return res;
    },
  });

  if (isLoading) return <div>{t("loading")}</div>;
  if (isError) return <div className="text-red-500">{t("error")}</div>;

  const doneProposals = (proposals || []).filter(
    (proposal) =>
      proposal.status === "accepted" || proposal.status === "rejected"
  );

  return (
    <div className="flex flex-col gap-6">
      {doneProposals.length > 0 ? (
        doneProposals.map((proposal) => (
          <VotingDoneCard key={proposal.id} proposal={proposal} />
        ))
      ) : (
        <div>{t("no_proposals_done")}</div>
      )}
    </div>
  );
};

export default VotingDoneList;
