"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  if (!features.community.learner.resources.documents) {
    notFound();
  }
  return <div>Documents de la communauté {id}</div>;
}
