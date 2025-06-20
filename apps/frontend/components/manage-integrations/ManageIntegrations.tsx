import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { DiscordLimitationTooltip } from "./components/DiscordLimitationTooltip";
import { DiscordLimitationAlert } from "./components/DiscordLimitationAlert";
import { FirstConfigAlert } from "./components/FirstConfigAlert";
import { AssignedChannelsAlert } from "./components/AssignedChannelsAlert";
import { ChannelSections } from "./components/ChannelSections";
import { useTranslations } from "next-intl";

/**
 * ManageIntegrations - Explications d'architecture
 *
 * Ce composant est le point d'entrée principal pour la gestion des intégrations Discord d'une communauté.
 * Il ne contient aucune logique métier directe : il délègue toute la logique d'état, d'actions et de calculs au custom hook useChannelSections.
 *
 * Il se contente de composer des sous-composants d'affichage :
 *   - ChannelSections (affichage et gestion des sections de salons)
 *   - Diverses alertes et tooltips (FirstConfigAlert, DiscordLimitationAlert, etc.)
 *
 * Le hook useChannelSections lui fournit tout ce dont il a besoin (états, actions, données calculées) sous forme d'objets, qu'il transmet aux sous-composants via spread {...state} {...actions} {...meta}.
 *
 * Avantages :
 *   - Le composant principal reste ultra-léger, lisible et découplé de la logique métier
 *   - Toute la logique complexe est centralisée dans le hook
 *   - L'affichage est facilement modulaire et évolutif
 *
 * Voir aussi :
 *   - useChannelSections (logique métier)
 *   - ChannelSections (affichage des sections de salons)
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: any;
  actions: any;
  meta: any;
  allIdsNull?: boolean;
}

export const ManageIntegrations: React.FC<Props> = ({
  open,
  onOpenChange,
  state,
  actions,
  meta,
  allIdsNull,
}) => {
  const t = useTranslations("manageIntegrations");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {allIdsNull ? (
            <>
              <FirstConfigAlert />
              <ChannelSections
                mode="firstConfig"
                {...state}
                {...actions}
                {...meta}
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-base">
                  {t("discordLimitation")}
                </span>
                <DiscordLimitationTooltip />
              </div>
              <DiscordLimitationAlert />
              <AssignedChannelsAlert />
              <ChannelSections
                mode="edition"
                {...state}
                {...actions}
                {...meta}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageIntegrations;
