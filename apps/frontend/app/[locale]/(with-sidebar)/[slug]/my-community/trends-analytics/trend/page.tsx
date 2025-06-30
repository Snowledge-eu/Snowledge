"use client";
import { TrendInputCard } from "@/components/my-community/trendes-analytics/trend/trend-input";
import {
  FAKE_TREND_RESULT,
  TrendResultCard,
} from "@/components/my-community/trendes-analytics/trend/trend-result";
import { Card } from "@repo/ui";
import {
  FAKE_TREND_HISTORY,
  TrendListCard,
} from "@/components/my-community/trendes-analytics/trend/trend-list";
import { PlatformIconButton } from "@/components/my-community/trendes-analytics/platform-icon-buttons";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
const platforms = [
  {
    key: "discord",
    name: "Discord",
    url: "https://discord.com",
    color: "#5865F2",
    options: [
      { label: "#general", value: "general" },
      { label: "#announcements", value: "announcements" },
      { label: "#random", value: "random" },
      { label: "#support", value: "support" },
    ],
    type: "channels",
  },
    {
      key: 'youtube',
      name: 'YouTube',
      url: 'https://youtube.com',
      color: '#FF0000',
      options: [
        { label: 'Intro to Voting', value: 'vid1' },
        { label: 'Community AMA', value: 'vid2' },
        { label: 'Feature Update', value: 'vid3' },
      ],
      type: 'videos',
    },
    {
      key: 'x',
      name: 'X',
      url: 'https://x.com',
      color: '#000000',
      options: [
        { label: 'Post 1', value: 'post1' },
        { label: 'Post 2', value: 'post2' },
        { label: 'Post 3', value: 'post3' },
      ],
      type: 'posts',
    },
    { key: 'instagram', name: 'Instagram', color: '#000000' },

];
export default function Page() {
  const { user, fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
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
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  // const [analysisId, setAnalysisId] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<any>();
  const [trendHistory, setTrendHistory] = useState<any[]>([]);
  // Mock data for channels and message count
  // const discordChannels = [
  //   { label: '#general', value: 'general' },
  //   { label: '#announcements', value: 'announcements' },
  //   { label: '#random', value: 'random' },
  //   { label: '#support', value: 'support' },
  // ]
  const [messageCount, setMessageCount] = useState(0);
  const canLaunch =
    messageCount > 0 && (scope === "all" || selectedChannels.length > 0);

  // // Mock result for demo
  // const mockResult = {
  //   sentiment: 'positive',
  //   confidence: 87,
  //   topics: [
  //     { title: 'Voting System', summary: 'Most users discussed the new voting system and its impact on community decisions.' },
  //     { title: 'Bot Issues', summary: 'Several users reported issues with the moderation bot not responding.' },
  //     { title: 'Upcoming AMA', summary: 'Excitement about the upcoming AMA with the founders.' },
  //   ],
  //   raw: '{ "sentiment": "positive", "topics": [ ... ] }',
  // }

  // function handleStart() {
  //   setLoading(true)
  //   setTimeout(() => {
  //     setResult(mockResult)
  //     setLoading(false)
  //   }, 1800)
  // }
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
        prompt_key: "discord_trends",
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
        const analysis = await fetcher(
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
              promptKey: "discord_trends",
            }),
          }
        ).catch((err) => console.error(err));

        setSelectedResult({
          _id: analysis?._id.toString(),
          id: analysis?.result?.id ? shortenString(analysis?.result?.id) : "temp", 
          timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
          platform: analysis?.platform,
          scope: "Custom", //TODO définir regle All | Custom
          trends: JSON.parse(analysis?.result?.choices[0].message.content).trends,
          date: new Date(analysis?.created_at).toLocaleDateString(),
          // dataCount: 1200,
          score: getRandomByLevel(JSON.parse(analysis?.result?.choices[0].message.content).confidence),
          notable_users: JSON.parse(analysis?.result?.choices[0].message.content)
            .notable_users,
          summary: JSON.parse(analysis?.result?.choices[0].message.content)
            .reasoning,
        });
        setLoading(false);
      }
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
  };
  const fetchAnalysis = async () => {
    const body = {
      platform: "discord",
      scope: {
        serverId: activeCommunity?.discordServerId,
      },
      promptKey: "discord_trends",
    };

    const analysis = await fetcher(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    ).catch((err) => console.error(err));
    if (analysis?.length > 0) {
      deserializeAnalyse(analysis);
    }
  };
  const deserializeAnalyse = (analysis: any[]) => {
    const tempArr = [];
    for (const item of analysis) {
      tempArr.push({
        _id: item?._id.toString(),
        id: item?.result?.id ? shortenString(item?.result?.id) : "temp", 
        timeframe: `${new Date(item?.period.from).toLocaleDateString()} to ${new Date(item?.period.to).toLocaleDateString()}`,
        platform: item?.platform,
        scope: "Custom", //TODO définir regle All | Custom
        trends: JSON.parse(item?.result?.choices[0].message.content).trends,
        date: new Date(item?.created_at).toLocaleDateString(),
        // dataCount: 1200,
        score: getRandomByLevel(JSON.parse(item?.result?.choices[0].message.content).confidence),
        notable_users: JSON.parse(item?.result?.choices[0].message.content)
          .notable_users,
        summary: JSON.parse(item?.result?.choices[0].message.content).reasoning,
      });
    }
    setTrendHistory(tempArr);
    setSelectedResult(tempArr[0]);
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
        channels: [{ id: string; name: string, harvested: boolean }];
      } = await data.json();

      
      const options = info.channels.map(channel => ({
        label: `#${channel.name}`,
        value: channel.id,
        disabled: !channel.harvested,
      }));
      const optionSelected = options.filter(op => !op.disabled);
      setDiscordChannels(options);
      setSelectedChannels(optionSelected);
    } catch (error) {
      console.error(error);
    }
  };
    const fetchMessageCount = async (
    channels: Array<{ label: string; value: string }>,
    interval: string
  ) =>{
    const body = {
      channelId: channels.map(chan => chan.value),
      interval: interval,
    };
    try {
      const data = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/count-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      setMessageCount(data);
    } catch(error) {
      console.error(error);
    }
  }
useEffect(() => {
  if (selectedChannels.length > 0 && timeRange) {
    fetchMessageCount(selectedChannels, timeRange);
  }
}, [selectedChannels, timeRange]);
  useEffect(() => {
    if (activeCommunity?.discordServerId) {
      fetchChannels(activeCommunity?.discordServerId);
      fetchAnalysis();
    }
    console.log(activeCommunity);
    console.log(user);
  }, []);
  return (
    <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
      {/* Panneau gauche (formulaire) */}
      <aside className="relative flex flex-col items-stretch h-full min-h-0">
        <TrendInputCard
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
          PlatformIconButton={PlatformIconButton}
        />
      </aside>
      {/* Panneau droit (résultat + historique) */}
      <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
        <TrendResultCard result={selectedResult} />
        <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
          <TrendListCard history={trendHistory} onSelect={setSelectedResult} />
        </Card>
      </section>
    </main>
  );
}
