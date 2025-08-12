"use client";
import { useChannelSections } from "@/components/manage-integrations/hooks/useChannelSections";
import { AnalysisInput } from "@/components/my-community/analysis/shared";
import {
  SummaryList,
  SummaryResult,
} from "@/components/my-community/analysis/summary-components";
import {
  TrendList,
  TrendResult,
} from "@/components/my-community/analysis/trend-components";
import {
  GenericList,
  GenericResult,
} from "@/components/my-community/analysis/generic-components";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { usePrompts } from "@/hooks/usePrompts";
import { Card } from "@repo/ui";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const { user, fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
  const { isLoading, meta } = useChannelSections(activeCommunity?.id || 0);
  const { data: prompts, isLoading: promptsLoading } = usePrompts(user?.id);
  const queryClient = useQueryClient();

  // États partagés
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

  // État pour la sélection de prompts
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  // Fonction pour gérer la création de nouveaux prompts

  const handlePromptCreated = async (promptData: any) => {
    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/prompts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promptData),
        }
      );

      if (response.ok) {
        toast.success("Prompt créé avec succès !");
        // Sélectionner automatiquement le nouveau prompt
        setSelectedPrompt(promptData.name);
        // Invalider le cache pour recharger la liste des prompts
        queryClient.invalidateQueries({ queryKey: ["prompts"] });
      } else {
        toast.error("Erreur lors de la création du prompt");
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast.error("Erreur lors de la création du prompt");
    }
  };

  // États pour les résultats
  const [selectedResult, setSelectedResult] = useState<any>();
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  // Demo props (adapter selon besoin réel)
  const platforms = [
    { key: "discord", name: "Discord", color: "#5865F2" },
    { key: "youtube", name: "YouTube", color: "#FF0000" },
    { key: "x", name: "X", color: "#000000" },
    { key: "instagram", name: "Instagram", color: "#000000" },
  ];

  // canLaunch basé sur la sélection de prompts
  const canLaunch = Boolean(
    selectedPrompt &&
      messageCount > 0 &&
      (scope === "all" || selectedChannels.length > 0)
  );

  // Fonction pour récupérer les canaux Discord (exactement comme dans les anciennes pages)
  const fetchChannels = async (guildId: string) => {
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

  // Fonction unifiée pour lancer l'analyse
  const startAnalysis = async (
    channels: Array<string>,
    model: string,
    period: string
  ) => {
    if (!selectedPrompt) {
      toast.error("Please select an analysis type");
      return;
    }

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

      console.log("🔍 res:", res);

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
              promptKey: selectedPrompt,
            }),
          }
        ).catch((err) => console.error(err));

        const analysis = analysisResponse?.data;

        // Déterminer le type d'analyse basé sur le prompt sélectionné
        const isSummaryAnalysis =
          selectedPrompt.toLowerCase().includes("summary") ||
          selectedPrompt.toLowerCase().includes("résumé");

        const isTrendAnalysis =
          selectedPrompt.toLowerCase().includes("trend") ||
          selectedPrompt.toLowerCase().includes("tendance");

        if (isSummaryAnalysis) {
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
            notable_users: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).notable_users,
            action_points: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).action_points,
            date: new Date(analysis?.created_at).toLocaleDateString(),
            score: getRandomByLevel(
              parseJsonContent(analysis?.result?.choices[0].message.content)
                .confidence
            ),
            summary: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).summary,
          });
        } else if (isTrendAnalysis) {
          setSelectedResult({
            _id: analysis?._id.toString(),
            id: analysis?.result?.id
              ? shortenString(analysis?.result?.id)
              : "temp",
            timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
            platform: analysis?.platform,
            scope: "Custom", //TODO définir regle All | Custom
            trends: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).trends,
            date: new Date(analysis?.created_at).toLocaleDateString(),
            score: getRandomByLevel(
              parseJsonContent(analysis?.result?.choices[0].message.content)
                .confidence
            ),
            notable_users: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).notable_users,
            summary: parseJsonContent(
              analysis?.result?.choices[0].message.content
            ).reasoning,
          });
        } else {
          // Analyse générique (ni summary ni trend)
          console.log(
            "🔍 GenericResult - Raw resultrereere:",
            analysis?.result?.choices[0].message.content
          );
          const parsedContent = parseJsonContent(
            analysis?.result?.choices[0].message.content || "{}"
          );

          console.log(
            "🔍 GenericResult - Parsed contrerereent:",
            parsedContent
          );

          let analysisContent = "No analysis content available";
          let notable_users = [];

          // Essayer d'extraire le contenu de l'analyse
          if (parsedContent.summary) {
            analysisContent = parsedContent.summary;
          } else if (parsedContent.analysis) {
            analysisContent = parsedContent.analysis;
          } else if (parsedContent.content) {
            analysisContent = parsedContent.content;
          } else if (parsedContent.result) {
            analysisContent = parsedContent.result;
          } else if (typeof parsedContent === "string") {
            analysisContent = parsedContent;
          }

          // Extraire les utilisateurs notables si disponibles
          if (parsedContent.notable_users) {
            notable_users = parsedContent.notable_users;
          }

          setSelectedResult({
            _id: analysis?._id?.toString(),
            id: analysis?.result?.id
              ? shortenString(analysis?.result?.id)
              : "temp",
            timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
            platform: analysis?.platform,
            scope: "Custom",
            date: new Date(analysis?.created_at).toLocaleDateString(),
            score: getRandomByLevel(parsedContent.confidence || "Low"),
            notable_users: notable_users,
            summary: analysisContent,
            analysis: analysisContent, // Pour le composant GenericResult
          });
        }
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

  // Fonction pour nettoyer et parser le contenu JSON
  const parseJsonContent = (content: string): any => {
    if (!content) return {};

    try {
      // Nettoyer le contenu des markdown code blocks
      let cleanedContent = content.trim();

      // Supprimer les backticks et les labels de code blocks
      cleanedContent = cleanedContent.replace(/```json\s*/g, "");
      cleanedContent = cleanedContent.replace(/```\s*$/g, "");
      cleanedContent = cleanedContent.replace(/^\s*```\s*/g, "");

      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error("Error parsing JSON content:", error);
      console.error("Original content:", content);
      return {};
    }
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

  // Fonction pour récupérer l'historique des analyses
  const fetchAnalysis = async () => {
    if (!selectedPrompt) return;

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
      console.log(`📋 Past analyses for "${selectedPrompt}":`, analysis);
      deserializeAnalysis(analysis);
    } else {
      console.log(`❌ No past analyses found for "${selectedPrompt}"`);
      setAnalysisHistory([]);
      setSelectedResult(undefined);
    }
  };

  const deserializeAnalysis = (analysis: any[]) => {
    const tempArr = [];
    for (let index = 0; index < analysis.length; index++) {
      const item = analysis[index];

      const periodFrom = item?.period?.from
        ? new Date(item.period.from).toLocaleDateString()
        : "N/A";
      const periodTo = item?.period?.to
        ? new Date(item.period.to).toLocaleDateString()
        : "N/A";

      const parsedContent = parseJsonContent(
        item?.result?.choices?.[0]?.message?.content || "{}"
      );

      const isSummaryAnalysis =
        selectedPrompt.toLowerCase().includes("summary") ||
        selectedPrompt.toLowerCase().includes("résumé");

      const isTrendAnalysis =
        selectedPrompt.toLowerCase().includes("trend") ||
        selectedPrompt.toLowerCase().includes("tendance");

      if (isSummaryAnalysis) {
        const summaryItem = {
          id: item?.result?.id
            ? shortenString(item?.result?.id)
            : `temp-${index}`,
          timeframe: `${periodFrom} to ${periodTo}`,
          platform: item?.platform || "N/A",
          scope: "Custom",
          action_points:
            parseJsonContent(
              item?.result?.choices?.[0]?.message?.content || "{}"
            ).action_points || [],
          date: item?.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "N/A",
          summary:
            parseJsonContent(
              item?.result?.choices?.[0]?.message?.content || "{}"
            ).summary || "No summary available",
        };
        tempArr.push(summaryItem);
      } else if (isTrendAnalysis) {
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

        const trendItem = {
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
          notable_users: notable_users,
          summary: summary,
        };
        tempArr.push(trendItem);
      } else {
        // Analyse générique (ni summary ni trend)

        const genericItem = {
          _id: item?._id?.toString() || `temp-${index}`,
          id: item?.result?.id
            ? shortenString(item?.result?.id)
            : `temp-${index}`,
          timeframe: `${periodFrom} to ${periodTo}`,
          platform: item?.platform || "N/A",
          scope: "Custom",
          date: item?.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "N/A",
          analysisData: parseJsonContent(
            item?.result?.choices?.[0]?.message?.content || "{}"
          ),
        };
        console.log("🔍 genericItem:", genericItem);
        tempArr.push(genericItem);
      }
    }
    setAnalysisHistory(tempArr);
    setSelectedResult(tempArr[0]);
  };

  // Effet pour refetch l'historique quand le prompt change
  useEffect(() => {
    if (activeCommunity?.discordServerId && selectedPrompt) {
      // Réinitialiser l'état avant de charger les nouvelles données
      setSelectedResult(undefined);
      setAnalysisHistory([]);
      fetchAnalysis();
    }
  }, [selectedPrompt]);

  // Déterminer le type d'analyse basé sur le prompt sélectionné
  const isSummaryAnalysis =
    selectedPrompt?.toLowerCase().includes("summary") ||
    selectedPrompt?.toLowerCase().includes("résumé");

  const isTrendAnalysis =
    selectedPrompt?.toLowerCase().includes("trend") ||
    selectedPrompt?.toLowerCase().includes("tendance");

  // Déterminer le type d'affichage
  const getAnalysisType = () => {
    if (isSummaryAnalysis) return "summary";
    if (isTrendAnalysis) return "trend";
    return "generic";
  };

  const analysisType = getAnalysisType();

  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <AnalysisInput
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
          onStart={startAnalysis}
          selectedPrompt={selectedPrompt}
          onPromptChange={setSelectedPrompt}
          prompts={prompts || []}
          promptsLoading={promptsLoading}
          onPromptCreated={handlePromptCreated}
        />
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
                history={analysisHistory}
                onSelect={setSelectedResult}
              />
            </Card>
          </>
        ) : analysisType === "trend" ? (
          <>
            <TrendResult result={selectedResult} />
            <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
              <TrendList
                history={analysisHistory}
                onSelect={setSelectedResult}
              />
            </Card>
          </>
        ) : (
          <>
            <GenericResult result={selectedResult} />
            <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
              <GenericList
                history={analysisHistory}
                onSelect={setSelectedResult}
                promptName={selectedPrompt}
              />
            </Card>
          </>
        )}
      </section>
    </main>
  );
}
