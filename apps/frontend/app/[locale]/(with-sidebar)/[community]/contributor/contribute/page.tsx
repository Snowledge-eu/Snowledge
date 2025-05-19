"use client";

import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.contributor.contribute.enabled) {
    notFound();
  }
  return <div>Section Contribuer pour la communauté {community}</div>;
}
