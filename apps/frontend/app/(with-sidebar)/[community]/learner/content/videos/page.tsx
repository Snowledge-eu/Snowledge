"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { community } = useParams();
  if (!features.community.learner.content.videos) {
    notFound();
  }
  return <div>Vidéos de la communauté {community}</div>;
}
