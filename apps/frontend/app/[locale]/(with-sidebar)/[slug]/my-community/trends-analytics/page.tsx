"use client";
import { useParams } from "next/navigation";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.trendsAnalytics) {
    notFound();
  }
  return <div>
      <span>Tendances et analytics pour la communauté {slug}</span>
      <Link href={`/${slug}/my-community/trends-analytics/sentiment`}>sentiment</Link>
      <Link href={`/${slug}/my-community/trends-analytics/summary`}>summary</Link>
      <Link href={`/${slug}/my-community/trends-analytics/trend`}>trend</Link>
    </div>;
}
