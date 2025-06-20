"use client";

import { fromSlug } from "@/utils/slug";
import { useParams, useSearchParams } from "next/navigation";
import { Dashboard1 } from "@/components/dashboard-1";
import { useEffect, useState } from "react";
import { ManageIntegrations } from "@/components/manage-integrations/ManageIntegrations";
import { useChannelSections } from "@/components/manage-integrations/hooks/useChannelSections";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";

export default function Page() {
  const { slug } = useParams();
  const { activeCommunity } = useCurrentCommunity();
  const [manageIntegrationsOpen, setManageIntegrationsOpen] = useState(false);
  const { isLoading, allIdsNull, state, actions, meta } = useChannelSections(
    activeCommunity?.id || 0
  );
  //Récupérer le vérify dans l'url
  const searchParams = useSearchParams();
  const verify = searchParams.get("verify");

  useEffect(() => {
    if (verify === "discord") {
      if (!isLoading) setManageIntegrationsOpen(true);
    }
  }, [verify, isLoading]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="text-2xl font-bold">
          Dashboard de la communauté {fromSlug(slug as string)}
        </h1>
        <p className="text-sm text-gray-500">
          Cette communauté est une communauté de test. Elle est créée pour
          tester le dashboard.
        </p>
      </div>
      <Dashboard1 />;
      <ManageIntegrations
        open={manageIntegrationsOpen}
        onOpenChange={setManageIntegrationsOpen}
        state={state}
        actions={actions}
        meta={meta}
        allIdsNull={allIdsNull}
      />
    </div>
  );
}
