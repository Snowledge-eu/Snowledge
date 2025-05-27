import React from "react";
import { CommunityContext } from "@/components/sidebar/community-context";

export function useCurrentCommunity() {
  const ctx = React.useContext(CommunityContext);
  if (!ctx)
    throw new Error(
      "useCurrentCommunity must be used within CommunityProvider"
    );
  return ctx;
}
