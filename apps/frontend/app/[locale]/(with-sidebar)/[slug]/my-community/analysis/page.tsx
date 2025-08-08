"use client";
import { useChannelSections } from "@/components/manage-integrations/hooks/useChannelSections";
import {
  SummaryInput,
  TrendInput,
} from "@/components/my-community/analysis/shared";
import {
  SummaryList,
  SummaryResult,
} from "@/components/my-community/analysis/shared/summary-components";
import {
  TrendList,
  TrendResult,
} from "@/components/my-community/analysis/shared/trend-components";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { usePrompts } from "@/hooks/usePrompts";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

type AnalysisType = "summary" | "trend";

export default function Page() {
  const { user, fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
  const { isLoading, meta } = useChannelSections(activeCommunity?.id || 0);
  const { data: prompts, isLoading: promptsLoading } = usePrompts();

  // État pour le type d'analyse actuel
  const [analysisType, setAnalysisType] = useState<AnalysisType>("summary");

  // États partagés entre summary et trend
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
  const [mode, setMode] = useState<
    "Meta-Llama-3_3-70B-Instruct" | "DeepSeek-R1-Distill-Llama-70B"
  >("Meta-Llama-3_3-70B-Instruct");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);

  // États spécifiques aux trends
  const [selectedPrompt, setSelectedPrompt] =
    useState<string>("discord_trends");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  // États pour les résultats
  const [selectedResult, setSelectedResult] = useState<any>();
  const [summaryHistory, setSummaryHistory] = useState<any[]>([]);
  const [trendHistory, setTrendHistory] = useState<any[]>([]);

  // Demo props (adapter selon besoin réel)
  const platforms = [
    { key: "discord", name: "Discord", color: "#5865F2" },
    { key: "youtube", name: "YouTube", color: "#FF0000" },
    { key: "x", name: "X", color: "#000000" },
    { key: "instagram", name: "Instagram", color: "#000000" },
  ];

  // canLaunch différent selon le type d'analyse (comme dans les anciennes pages)
  const canLaunch =
    analysisType === "summary"
      ? true
      : messageCount > 0 && (scope === "all" || selectedChannels.length > 0);

  // Fonction pour récupérer les canaux Discord (exactement comme dans les anciennes pages)
  const fetchChannels = async (guildId: string) => {
    console.log("fetchChannel");
    try {
      if (meta && meta.listData) {
        const options = meta?.listData?.map((channel) => ({
          label: `#${channel.name}`,
          value: channel.id,
          disabled: !channel.harvested,
        }));
        const optionSelected = options?.filter((op) => !op.disabled);
        setDiscordChannels(options);
        setSelectedChannels(optionSelected);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Fonction pour récupérer le nombre de messages (exactement comme dans les anciennes pages)
  const fetchMessageCount = async (
    channels: Array<{ label: string; value: string }>,
    interval: string
  ) => {
    const body = {
      channelId: channels.map((chan) => chan.value),
      interval: interval,
    };
    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/count-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      setMessageCount(response?.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Effet pour récupérer le nombre de messages (exactement comme dans les anciennes pages)
  useEffect(() => {
    if (selectedChannels.length > 0 && timeRange) {
      fetchMessageCount(selectedChannels, timeRange);
    }
  }, [selectedChannels, timeRange]);

  // Effet pour initialiser (exactement comme dans les anciennes pages)
  useEffect(() => {
    if (activeCommunity?.discordServerId) {
      fetchChannels(activeCommunity?.discordServerId);
      fetchAnalysis();
    }
    console.log(activeCommunity);
    console.log(user);
  }, [isLoading]);

  // Fonction pour l'analyse de summary (exactement comme dans l'ancienne page summary)
  const startSummaryAnalysis = async (
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
        prompt_key: "discord_summary_by_timeframe",
        period: period,
      };
      console.log(body);
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis/discord`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 200 || res.status === 201) {
        console.log(res);
        const analysisResponse = await fetcher(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              platform: "discord",
              scope: {
                serverId: activeCommunity?.discordServerId,
                channelId: channel,
              },
              promptKey: "discord_summary_by_timeframe",
            }),
          }
        ).catch((err) => console.error(err));

        const analysis = analysisResponse?.data;
        setSelectedResult({
          id: analysis?.result?.id
            ? shortenString(analysis?.result?.id)
            : "temp",
          timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
          platform: analysis?.platform,
          scope: "Custom", //TODO définir regle All | Custom
          topics: [
            { title: "Bot Downtime" },
            { title: "New Voting Feature" },
            { title: "AMA with Founders" },
          ],
          notable_users: JSON.parse(
            analysis?.result?.choices[0].message.content
          ).notable_users,
          action_points: JSON.parse(
            analysis?.result?.choices[0].message.content
          ).action_points,
          date: new Date(analysis?.created_at).toLocaleDateString(),
          score: getRandomByLevel(
            JSON.parse(analysis?.result?.choices[0].message.content).confidence
          ),
          summary: JSON.parse(analysis?.result?.choices[0].message.content)
            .summary,
        });
      } else if (res.status === 204) {
        const reason = res.headers.get("x-reason");
        console.log(reason);
        toast.info(reason, {
          position: "top-center",
        });
      }
      setLoading(false);
    }
  };

  // Fonction pour l'analyse de trends (exactement comme dans l'ancienne page trend)
  const startTrendAnalysis = async (
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
        prompt_key: selectedPrompt,
        period: period,
      };
      console.log(body);
      const res = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis/discord`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (res.status === 200 || res.status === 201) {
        const analysisResponse = await fetcher(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              platform: "discord",
              scope: {
                serverId: activeCommunity?.discordServerId,
                channelId: channel,
              },
              promptKey: selectedPrompt,
            }),
          }
        ).catch((err) => console.error(err));

        const analysis = analysisResponse?.data;

        setSelectedResult({
          _id: analysis?._id.toString(),
          id: analysis?.result?.id
            ? shortenString(analysis?.result?.id)
            : "temp",
          timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
          platform: analysis?.platform,
          scope: "Custom", //TODO définir regle All | Custom
          trends: JSON.parse(analysis?.result?.choices[0].message.content)
            .trends,
          date: new Date(analysis?.created_at).toLocaleDateString(),
          score: getRandomByLevel(
            JSON.parse(analysis?.result?.choices[0].message.content).confidence
          ),
          notable_users: JSON.parse(
            analysis?.result?.choices[0].message.content
          ).notable_users,
          summary: JSON.parse(analysis?.result?.choices[0].message.content)
            .reasoning,
        });
      } else if (res.status === 204) {
        const reason = res.headers.get("x-reason");
        console.log(reason);
        toast.info(reason, {
          position: "top-center",
        });
      }
      setLoading(false);
    }
  };

  const shortenString = (str: string, maxLength: number = 10): string => {
    if (str.length <= maxLength) return str;
    return `${str.slice(0, 3)}...${str.slice(-3)}`;
  };

  function getRandomByLevel(level: "Low" | "Medium" | "High"): number | null {
    if (!level) return null;
    let min: number, max: number;

    switch (level) {
      case "Low":
        min = 1;
        max = 33;
        break;
      case "Medium":
        min = 34;
        max = 66;
        break;
      case "High":
        min = 67;
        max = 99;
        break;
      default:
        throw new Error(`Invalid level: ${level}`);
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Fonction pour récupérer l'historique des analyses (exactement comme dans les anciennes pages)
  const fetchAnalysis = async () => {
    if (analysisType === "summary") {
      const body = {
        platform: "discord",
        scope: {
          serverId: activeCommunity?.discordServerId,
        },
        promptKey: "discord_summary_by_timeframe",
        creator_id: Number(user?.id),
      };

      const analysisResponse = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      ).catch((err) => console.error(err));

      const analysis = analysisResponse?.data;
      if (analysis?.length > 0) {
        deserializeSummaryAnalysis(analysis);
      }
    } else {
      const body = {
        platform: "discord",
        scope: {
          serverId: activeCommunity?.discordServerId,
        },
        promptKey: selectedPrompt,
        creator_id: Number(user?.id),
      };

      const analysisResponse = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      ).catch((err) => console.error(err));

      const analysis = analysisResponse?.data;
      if (analysis?.length > 0) {
        deserializeTrendAnalysis(analysis);
      }
    }
  };

  const deserializeSummaryAnalysis = (analysis: any[]) => {
    const tempArr = [];
    for (let index = 0; index < analysis.length; index++) {
      const item = analysis[index];
      const periodFrom = item?.period?.from
        ? new Date(item.period.from).toLocaleDateString()
        : "N/A";
      const periodTo = item?.period?.to
        ? new Date(item.period.to).toLocaleDateString()
        : "N/A";

      tempArr.push({
        id: item?.result?.id
          ? shortenString(item?.result?.id)
          : `temp-${index}`,
        timeframe: `${periodFrom} to ${periodTo}`,
        platform: item?.platform || "N/A",
        scope: "Custom",
        topics: [
          { title: "Bot Downtime" },
          { title: "New Voting Feature" },
          { title: "AMA with Founders" },
        ],
        notable_users:
          JSON.parse(item?.result?.choices?.[0]?.message?.content || "{}")
            .notable_users || [],
        action_points:
          JSON.parse(item?.result?.choices?.[0]?.message?.content || "{}")
            .action_points || [],
        date: item?.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "N/A",
        score: getRandomByLevel(
          JSON.parse(item?.result?.choices?.[0]?.message?.content || "{}")
            .confidence || "Low"
        ),
        summary:
          JSON.parse(item?.result?.choices?.[0]?.message?.content || "{}")
            .summary || "No summary available",
      });
    }
    setSummaryHistory(tempArr);
    setSelectedResult(tempArr[0]);
  };

  const deserializeTrendAnalysis = (analysis: any[]) => {
    const tempArr = [];
    for (let index = 0; index < analysis.length; index++) {
      const item = analysis[index];
      const periodFrom = item?.period?.from
        ? new Date(item.period.from).toLocaleDateString()
        : "N/A";
      const periodTo = item?.period?.to
        ? new Date(item.period.to).toLocaleDateString()
        : "N/A";

      const parsedContent = JSON.parse(
        item?.result?.choices?.[0]?.message?.content || "{}"
      );

      let trends = [];
      let notable_users = [];
      let summary = "No reasoning available";

      if (parsedContent.trending_topics) {
        trends = parsedContent.trending_topics.map((topic: any) => ({
          title: topic.topic,
          summary: `Frequency: ${topic.frequency}, Engagement: ${topic.engagement}`,
        }));
        summary = parsedContent.analysis || "No analysis available";
      } else if (parsedContent.trends) {
        trends = parsedContent.trends;
        notable_users = parsedContent.notable_users || [];
        summary = parsedContent.reasoning || "No reasoning available";
      }

      tempArr.push({
        _id: item?._id?.toString() || `temp-${index}`,
        id: item?.result?.id
          ? shortenString(item?.result?.id)
          : `temp-${index}`,
        timeframe: `${periodFrom} to ${periodTo}`,
        platform: item?.platform || "N/A",
        scope: "Custom",
        trends: trends,
        date: item?.created_at
          ? new Date(item.created_at).toLocaleDateString()
          : "N/A",
        score: getRandomByLevel(parsedContent.confidence || "Low"),
        notable_users: notable_users,
        summary: summary,
      });
    }
    setTrendHistory(tempArr);
    setSelectedResult(tempArr[0]);
  };

  // Effet pour refetch l'historique quand le type d'analyse change
  useEffect(() => {
    if (activeCommunity?.discordServerId) {
      fetchAnalysis();
    }
  }, [analysisType, selectedPrompt]);

  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <Tabs
          value={analysisType}
          onValueChange={(value) => setAnalysisType(value as AnalysisType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="summary">Summary Analysis</TabsTrigger>
            <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="mt-0">
            <SummaryInput
              platforms={platforms}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              scope={scope}
              onScopeChange={setScope}
              discordChannels={discordChannels}
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
              onStart={startSummaryAnalysis}
            />
          </TabsContent>

          <TabsContent value="trend" className="mt-0">
            <TrendInput
              platforms={platforms}
              selectedPlatform={selectedPlatform}
              onSelectPlatform={setSelectedPlatform}
              scope={scope}
              onScopeChange={setScope}
              discordChannels={discordChannels}
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
              onStart={startTrendAnalysis}
              selectedPrompt={selectedPrompt}
              onPromptChange={setSelectedPrompt}
              prompts={prompts || []}
              promptsLoading={promptsLoading}
            />
          </TabsContent>
        </Tabs>
      </aside>

      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        {analysisType === "summary" ? (
          <>
            <SummaryResult
              summary={selectedResult?.summary || ""}
              action_points={selectedResult?.action_points || []}
              timeframe={selectedResult?.timeframe || selectedResult?.date}
              activityLevel={selectedResult?.activityLevel || "Medium"}
            />
            <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
              <SummaryList
                history={summaryHistory}
                onSelect={setSelectedResult}
              />
            </Card>
          </>
        ) : (
          <>
            <TrendResult result={selectedResult} />
            <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
              <TrendList history={trendHistory} onSelect={setSelectedResult} />
            </Card>
          </>
        )}
      </section>
    </main>
  );
}
