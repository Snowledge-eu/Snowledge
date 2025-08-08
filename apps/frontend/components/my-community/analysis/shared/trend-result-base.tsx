import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  Button,
  Card,
  Separator,
} from "@repo/ui";
import React from "react";
import { TimeframeBadge } from "../timeframe-badge";
import { PlatformAndScopeRow } from "../platform-and-scope-row";
import Link from "next/link";
import { useParams } from "next/navigation";

// ============
// Function: TrendResultBase
// ------------
// DESCRIPTION: Composant de base pour les résultats de trends avec la logique spécifique aux trends
// PARAMS: result: object formatted per discord_trends_v2 schema
// RETURNS: JSX.Element
// ============
export function TrendResultBase({ result }: { result: any }) {
  if (!result) return null;
  const { slug } = useParams();

  const activityColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-100 text-green-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-red-100 text-red-700";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const platform = result?.platform || "discord";
  const scope = result?.scope || "all";

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div className="text-lg font-semibold flex items-center gap-2">
          Trend Analysis
        </div>
        {result?.timeframe && <TimeframeBadge timeframe={result?.timeframe} />}
      </div>

      <PlatformAndScopeRow
        platform={platform}
        scope={scope}
        label={platform.charAt(0).toUpperCase() + platform.slice(1)}
      />

      {/* Top 3 Influential Users Podium */}
      <div className="flex flex-col items-center my-4">
        <div className="text-base font-semibold mb-2">
          Top 3 Influential Users
        </div>
        <div className="flex justify-center items-end gap-6 w-full max-w-xs mx-auto">
          {/* Top 2 */}
          {result?.notable_users?.[1] && (
            <div className="flex flex-col items-center">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                #2
              </div>
              <Avatar className="size-10">
                <AvatarFallback>{result?.notable_users[1][0]}</AvatarFallback>
              </Avatar>
              <span
                className="text-xs mt-1 text-foreground max-w-[64px] truncate"
                title={result?.notable_users[1]}
              >
                {result?.notable_users[1]}
              </span>
            </div>
          )}
          {/* Top 1 */}
          {result?.notable_users?.[0] && (
            <div className="flex flex-col items-center">
              <div className="mb-1 text-xs font-bold text-yellow-600">#1</div>
              <Avatar className="size-14 ring-2 ring-yellow-400">
                <AvatarFallback>{result?.notable_users[0][0]}</AvatarFallback>
              </Avatar>
              <span
                className="text-sm mt-1 font-semibold text-foreground max-w-[80px] truncate"
                title={result?.notable_users[0]}
              >
                {result?.notable_users[0]}
              </span>
            </div>
          )}
          {/* Top 3 */}
          {result?.notable_users?.[2] && (
            <div className="flex flex-col items-center">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                #3
              </div>
              <Avatar className="size-10">
                <AvatarFallback>{result?.notable_users[2][0]}</AvatarFallback>
              </Avatar>
              <span
                className="text-xs mt-1 text-foreground max-w-[64px] truncate"
                title={result?.notable_users[2]}
              >
                {result?.notable_users[2]}
              </span>
            </div>
          )}
        </div>
      </div>

      <Separator className="my-4" />

      <Accordion type="multiple" className="space-y-2">
        {Array.isArray(result?.trends) && result?.trends.length > 0 ? (
          result?.trends.map((trend: any, index: number) => (
            <AccordionItem value={`trend-${index}`} key={index}>
              <AccordionTrigger className="py-3">
                <div className="flex w-full justify-between items-center">
                  <span className="text-lg font-semibold">{trend?.title}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded ${activityColor(trend?.activity_level)}`}
                  >
                    {trend?.activity_level}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  {trend?.summary}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium mt-2 mb-1">
                    Representative Messages
                  </div>
                  <ul className="list-disc ml-5 text-sm space-y-1">
                    {trend?.representative_messages?.map(
                      (msg: string, idx: number) => <li key={idx}>{msg}</li>
                    )}
                  </ul>
                </div>
                <Link
                  href={`/${slug}/summary?analysisId=${result._id}&trendId=${index}`}
                >
                  <Button
                    className="w-24 justify-self-end"
                    aria-label="Start support"
                  >
                    Start support
                  </Button>
                </Link>
              </AccordionContent>
            </AccordionItem>
          ))
        ) : (
          <div className="text-muted-foreground text-center text-sm py-4">
            No trends available.
          </div>
        )}
      </Accordion>
    </Card>
  );
}
