"use client";

import { features } from "@/config/features";
import { notFound, useParams } from "next/navigation";
import { CommunityManager } from "@/components/manage-community/CommunityManager";

export default function Page() {
  if (!features.community.myCommunity.generalInformations) {
    notFound();
  }
  return <CommunityManager />;
}
