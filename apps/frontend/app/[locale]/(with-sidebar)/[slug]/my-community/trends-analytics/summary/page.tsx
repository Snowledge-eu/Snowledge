"use client";
import { PlatformIconButton } from "@/components/my-community/trendes-analytics/platform-icon-buttons";
import { SummaryInput } from "@/components/my-community/trendes-analytics/summary/summary-input";
import {
  FAKE_SUMMARY_HISTORY,
  SummaryList,
} from "@/components/my-community/trendes-analytics/summary/summary-list";
import { SummaryHistory } from "@/components/my-community/trendes-analytics/summary/summary-list";
import SummaryResult from "@/components/my-community/trendes-analytics/summary/summary-result";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { Card } from "@repo/ui";
import React, { useEffect, useState } from "react";
export default function Page() {
  const { user } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
  const [selectedResult, setSelectedResult] = useState<SummaryHistory>(
    FAKE_SUMMARY_HISTORY[0]
  );
  // Demo props (adapter selon besoin réel)
  const platforms = [
    { key: "discord", name: "Discord", color: "#5865F2" },
    // { key: 'youtube', name: 'YouTube', color: '#FF0000' },
    // { key: 'x', name: 'X', color: '#000000' },
  ];
  const [selectedPlatform, setSelectedPlatform] = useState("discord");
  const [scope, setScope] = useState<"all" | "custom">("all");
  const [discordChannels, setDiscordChannels] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [selectedChannels, setSelectedChannels] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [timeRange, setTimeRange] = useState("last_week");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [mode, setMode] = useState<"standard" | "reasoning">("standard");
  const [loading, setLoading] = useState(false);
  const messageCount = 1200;
  const canLaunch = true;
  const startAnalysis = async (
    channels: Array<string>,
    model: string,
    period: string
  ) => {
    setLoading(true);
    for (const channel of channels) {
      const body = {
        creator_id: Number(user.id),
        serverId: activeCommunity?.discordServerId,
        channelId: channel,
        model_name: model,
        prompt_key: "sentiment",
        period: period,
      };
      console.log(body);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        setLoading(false);
      }
    }
  };
  const fetchChannels = async (guildId: string) => {
    console.log("fetchChannel");
    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/channels/${guildId}`,
        {
          method: "GET",
        }
      );
      const info: {
        server_id: string;
        server_name: string;
        channels: [{ id: string; name: string }];
      } = await data.json();
      console.log(info);
      const options: Array<{ label: string; value: string }> = [];
      for (const channel of info.channels) {
        options.push({ label: `#${channel.name}`, value: channel.id });
      }
      setDiscordChannels(options);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    if (activeCommunity?.discordServerId) {
      fetchChannels(activeCommunity?.discordServerId);
    }
    console.log(activeCommunity);
    console.log(user);
  }, []);
  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <SummaryInput
          platforms={platforms}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          scope={scope}
          onScopeChange={setScope}
          discordChannels={[]}
          selectedChannels={selectedChannels}
          onChannelsChange={setSelectedChannels}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          customDate={customDate}
          onCustomDateChange={setCustomDate}
          mode={mode}
          onModeChange={setMode}
          messageCount={messageCount}
          canLaunch={canLaunch}
          loading={loading}
          onStart={startAnalysis}
          // PlatformIconButton={PlatformIconButton}
        />
      </aside>
      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        <SummaryResult
          summary={selectedResult.summary}
          action_points={selectedResult.action_points || []}
          timeframe={selectedResult.timeframe || selectedResult.date}
        />
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
          <SummaryList
            history={FAKE_SUMMARY_HISTORY}
            onSelect={setSelectedResult}
          />
        </Card>
      </section>
    </main>
  );
}
