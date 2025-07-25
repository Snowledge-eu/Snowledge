// "use client";
// import { useEffect, useState } from "react";

// import { SentimentInput } from "@/components/my-community/trendes-analytics/sentiment/sentiment-input";
// import { Card } from "@repo/ui";
// import { SentimentDisplay } from "@/components/my-community/trendes-analytics/sentiment/sentiment-result";
// import {
//   FAKE_SENTIMENT_HISTORY,
//   SentimentListCard,
// } from "@/components/my-community/trendes-analytics/sentiment/sentiment-list-card";
// import { PlatformIconButton } from "@/components/my-community/trendes-analytics/platform-icon-buttons";
// import { useAuth } from "@/contexts/auth-context";
// import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
// import { interval } from "date-fns";
// import { toast } from "sonner";

// export default function Page() {
//   const { user, fetcher } = useAuth();
//   const { activeCommunity } = useCurrentCommunity();
//   const [selectedResult, setSelectedResult] = useState<any>();
//   const [sentimentHistory, setSentimentHistory] = useState<any[]>([]);
//   // Réutilisation des props pour la démo
//   const platforms = [
//     { key: "discord", name: "Discord", color: "#5865F2" },
//     { key: "youtube", name: "YouTube", color: "#FF0000" },
//     { key: "x", name: "X", color: "#000000" },
//     { key: "instagram", name: "Instagram", color: "#000000" },
//   ];
//   const [selectedPlatform, setSelectedPlatform] = useState("discord");
//   const [scope, setScope] = useState<"all" | "custom">("all");
//   const [discordChannels, setDiscordChannels] = useState<
//     Array<{ label: string; value: string }>
//   >([]);
//   const [selectedChannels, setSelectedChannels] = useState<
//     Array<{ label: string; value: string }>
//   >([]);
//   const [timeRange, setTimeRange] = useState("last_week");
//   const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
//   const [mode, setMode] = useState<
//     "Meta-Llama-3_3-70B-Instruct" | "DeepSeek-R1-Distill-Llama-70B"
//   >("Meta-Llama-3_3-70B-Instruct");
//   const [loading, setLoading] = useState(false);
//   const [messageCount, setMessageCount] = useState(0);
//   const canLaunch = true;
//   const startAnalysis = async (
//     channels: Array<string>,
//     model: string,
//     period: string
//   ) => {
//     setLoading(true);
//     for (const channel of channels) {
//       const body = {
//         creator_id: Number(user.id),
//         serverId: activeCommunity?.discordServerId,
//         channelId: channel,
//         model_name: model,
//         prompt_key: "discord_sentiment",
//         period: period,
//       };
//       console.log(body);
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/analyze`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(body),
//         }
//       );

//       if (res.status === 200) {
//         const analysis = await fetcher(
//           `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               platform: "discord",
//               scope: {
//                 serverId: activeCommunity?.discordServerId,
//                 channelId: channel,
//               },
//               promptKey: "discord_sentiment",
//             }),
//           }
//         ).catch((err) => console.error(err));
//         setSelectedResult({
//           id: analysis?.result?.id
//             ? shortenString(analysis?.result?.id)
//             : "temp",
//           timeframe: `${new Date(analysis?.period.from).toLocaleDateString()} to ${new Date(analysis?.period.to).toLocaleDateString()}`,
//           platform: analysis?.platform,
//           scope: "Custom", //TODO définir regle All | Custom
//           sentiment: JSON.parse(analysis?.result?.choices[0].message.content)
//             .sentiment,
//           messages: JSON.parse(
//             analysis?.result?.choices[0].message.content
//           ).representative_messages.map((msg: string) => {
//             return {
//               user: msg.split(": ")[0].split("]")[1],
//               text: msg.split(": ")[1]?.trim() || "",
//             };
//           }),
//           date: new Date(analysis?.created_at).toLocaleDateString(),
//           score: getRandomByLevel(
//             JSON.parse(analysis?.result?.choices[0].message.content).confidence
//           ),
//           summary: JSON.parse(analysis?.result?.choices[0].message.content)
//             .reasoning,
//         });
//       } else if (res.status === 204) {
//         const reason = res.headers.get("x-reason");
//         console.log(reason);
//         toast.info(reason, {
//           position: "top-center",
//         });
//       }
//       setLoading(false);
//     }
//   };
//   const shortenString = (str: string, maxLength: number = 10): string => {
//     if (str.length <= maxLength) return str;
//     return `${str.slice(0, 3)}...${str.slice(-3)}`;
//   };
//   function getRandomByLevel(level: "Low" | "Medium" | "High"): number | null {
//     if (!level) return null;
//     let min: number, max: number;

//     switch (level) {
//       case "Low":
//         min = 1;
//         max = 33;
//         break;
//       case "Medium":
//         min = 34;
//         max = 66;
//         break;
//       case "High":
//         min = 67;
//         max = 99;
//         break;
//       default:
//         throw new Error(`Invalid level: ${level}`);
//     }

//     return Math.floor(Math.random() * (max - min + 1)) + min;
//   }
//   const fetchAnalysis = async () => {
//     const body = {
//       platform: "discord",
//       scope: {
//         serverId: activeCommunity?.discordServerId,
//       },
//       promptKey: "discord_sentiment",
//     };

//     const analysis = await fetcher(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(body),
//       }
//     ).catch((err) => console.error(err));
//     if (analysis?.length > 0) {
//       deserializeAnalyse(analysis);
//     }
//   };
//   const deserializeAnalyse = (analysis: any[]) => {
//     const tempArr = [];
//     for (const item of analysis) {
//       tempArr.push({
//         id: item?.result?.id ? shortenString(item?.result?.id) : "temp",
//         timeframe: `${new Date(item?.period.from).toLocaleDateString()} to ${new Date(item?.period.to).toLocaleDateString()}`,
//         platform: item?.platform,
//         scope: "Custom", //TODO définir regle All | Custom vient du back
//         sentiment: JSON.parse(item?.result?.choices[0].message.content)
//           .sentiment,
//         messages: JSON.parse(
//           item?.result?.choices[0].message.content
//         ).representative_messages.map((msg: string) => {
//           return {
//             user: msg.split(": ")[0].split("]")[1],
//             text: msg.split(": ")[1]?.trim() || "",
//           };
//         }),
//         date: new Date(item?.created_at).toLocaleDateString(),
//         // dataCount: -1, // qte mess fetch sur period choisi
//         score: getRandomByLevel(
//           JSON.parse(item?.result?.choices[0].message.content).confidence
//         ),
//         summary: JSON.parse(item?.result?.choices[0].message.content).reasoning,
//       });
//     }
//     setSentimentHistory(tempArr);
//     setSelectedResult(tempArr[0]);
//   };
//   const fetchChannels = async (guildId: string) => {
//     console.log("fetchChannel");
//     try {
//       const data = await fetch(
//         `${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/channels/${guildId}`,
//         {
//           method: "GET",
//         }
//       );
//       const info: {
//         server_id: string;
//         server_name: string;
//         channels: [{ id: string; name: string; harvested: boolean }];
//       } = await data.json();

//       const options = info.channels.map((channel) => ({
//         label: `#${channel.name}`,
//         value: channel.id,
//         disabled: !channel.harvested,
//       }));
//       const optionSelected = options.filter((op) => !op.disabled);
//       setDiscordChannels(options);
//       setSelectedChannels(optionSelected);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   const fetchMessageCount = async (
//     channels: Array<{ label: string; value: string }>,
//     interval: string
//   ) => {
//     const body = {
//       channelId: channels.map((chan) => chan.value),
//       interval: interval,
//     };
//     try {
//       const data = await fetcher(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/count-message`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(body),
//         }
//       );
//       setMessageCount(data);
//     } catch (error) {
//       console.error(error);
//     }
//   };
//   useEffect(() => {
//     if (selectedChannels.length > 0 && timeRange) {
//       fetchMessageCount(selectedChannels, timeRange);
//     }
//   }, [selectedChannels, timeRange]);
//   useEffect(() => {
//     if (activeCommunity?.discordServerId) {
//       fetchChannels(activeCommunity?.discordServerId);
//       fetchAnalysis();
//     }
//     console.log(activeCommunity);
//     console.log(user);
//   }, []);
//   return (
//     <main className="grid grid-cols-1 md:grid-cols-[minmax(640px,800px)_1fr] items-stretch gap-8 h-screen min-h-screen bg-background">
//       {/* Panneau gauche (formulaire) */}
//       <aside className="relative flex flex-col items-stretch h-full min-h-0">
//         <SentimentInput
//           platforms={platforms}
//           selectedPlatform={selectedPlatform}
//           onSelectPlatform={setSelectedPlatform}
//           scope={scope}
//           onScopeChange={setScope}
//           discordChannels={discordChannels}
//           selectedChannels={selectedChannels}
//           onChannelsChange={setSelectedChannels}
//           timeRange={timeRange}
//           onTimeRangeChange={setTimeRange}
//           customDate={customDate}
//           onCustomDateChange={setCustomDate}
//           mode={mode}
//           onModeChange={setMode}
//           messageCount={messageCount}
//           canLaunch={canLaunch}
//           loading={loading}
//           onStart={startAnalysis}
//           // PlatformIconButton={PlatformIconButton} // ERREUR: pas dans les parametre enfant ! A VOIR
//         />
//       </aside>
//       {/* Panneau droit (résultat + historique) */}
//       <section className="flex flex-col items-center justify-start h-full min-h-0 px-2 w-full">
//         <SentimentDisplay result={selectedResult} />
//         <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6 mt-8">
//           <SentimentListCard
//             history={sentimentHistory}
//             onSelect={setSelectedResult}
//           />
//         </Card>
//       </section>
//     </main>
//   );
// }
