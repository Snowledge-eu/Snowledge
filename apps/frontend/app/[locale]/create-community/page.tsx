"use client";

import { features } from "@/config/features";
import { notFound } from "next/navigation";
import CreateCommunityForm from "@/components/create-community/create-commu-form";

export default function CreateCommunity() {
  if (!features.createCommunity.enabled) {
    notFound();
  }
  return <CreateCommunityForm />;
}
