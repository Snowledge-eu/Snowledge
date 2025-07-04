"use client";
import { ManageIntegrations } from "@/components/manage-integrations/ManageIntegrations";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";

import {
  Button,
  Calendar,
  Card,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
  Switch,
} from "@repo/ui";
import { CalendarIcon, Download, Info } from "lucide-react";
import PlatformSettingsDialog from "./settings-dialog";
import { format } from "date-fns";
import { cn } from "@workspace/ui/lib/utils";
import { SocialIcon } from "react-social-icons";
import { MultiSelect } from "@/components/shared/community/ui/MultiSelect";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { DiscordHarvestJob } from "@/shared/interfaces/IDiscordHarvestJob";

export default function Page() {
  const { user, fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
  const [open, setOpen] = useState<string | null>(null);
  const [manageIntegrationsOpen, setManageIntegrationsOpen] = useState(false);

  const state = encodeURIComponent(
    JSON.stringify({ communityId: localStorage.getItem("activeCommunityId") })
  );
  // TODO: change to the correct client id
  const clientId = process.env.NEXT_PUBLIC_DSD_CLIENT_ID;

  const initialPlatforms = [
    {
      key: "discord",
      name: "Discord",
      url: "https://discord.com",
      urlAuth: `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=378225683536&response_type=code&redirect_uri=${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/link&integration_type=0&scope=bot+applications.commands+identify+guilds+email&state=${state}`,
      color: "#5865F2",
      options: [{ label: "", value: "" }],
      estimatedVolume: 1240,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "channels",
      account: {
        id: "",
        name: "",
        connected: false,
      },
    },
    {
      key: "youtube",
      name: "YouTube",
      url: "https://youtube.com",
      urlAuth: "",
      color: "#FF0000",
      options: [
        { label: "Intro to Voting", value: "vid1" },
        { label: "Community AMA", value: "vid2" },
        { label: "Feature Update", value: "vid3" },
      ],
      estimatedVolume: 3,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "videos",
      account: {
        id: "",
        name: "",
        connected: false,
      },
    },
    {
      key: "x",
      name: "X",
      url: "https://x.com",
      urlAuth: "",
      color: "#000000",
      options: [
        { label: "Post 1", value: "post1" },
        { label: "Post 2", value: "post2" },
        { label: "Post 3", value: "post3" },
      ],
      estimatedVolume: 12,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "posts",
      account: {
        id: "",
        name: "",
        connected: false,
      },
    },
    {
      key: "instagram",
      name: "Instagram",
      url: "https://instagram.com",
      urlAuth: "",
      color: "#000000",
      options: [
        { label: "Post 1", value: "post1" },
        { label: "Post 2", value: "post2" },
        { label: "Post 3", value: "post3" },
      ],
      estimatedVolume: 12,
      lastFetched: {
        date: new Date(),
        channels: [
          {
            name: "",
            qty: 0,
          },
        ],
      },
      type: "posts",
      account: {
        id: "",
        name: "",
        connected: false,
      },
    },
  ];
  const [channelFetched, setChannelFetched] = useState(false);
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [enabled, setEnabled] = useState({
    discord: false,
    youtube: false,
    x: false,
    instagram: false,
  }); //, youtube: false, x: false
  const [selected, setSelected] = useState({
    discord: [] as Array<{ label: string; value: string }>,
    youtube: [] as string[],
    x: [] as string[],
    instagram: [] as string[],
  });
  const [dates, setDates] = useState({
    discord: undefined as Date | undefined,
    youtube: undefined as Date | undefined,
    x: undefined as Date | undefined,
    instagram: undefined as Date | undefined,
  });
  const [timeRange, setTimeRange] = useState({
    discord: "last-week",
    youtube: "last-week",
    x: "last-week",
    instagram: "last-week",
  });
  const [isCollecting, setIsCollecting] = useState(false);

  useEffect(() => {
    if (user?.discordId || activeCommunity?.discordServerId) {
      setEnabled((prev) => ({ ...prev, discord: true }));
    }
  }, []);
  // ============
  // Function: handleCollect
  // ------------
  // DESCRIPTION: Handles the data collection trigger.
  // PARAMS: none
  // RETURNS: void
  // ============
  const handleCollect = async () => {
    setIsCollecting(true);
    const afterDate = getStartDateFromRange(timeRange.discord);
    const body = {
      discordId: user.discordId,
      serverId: activeCommunity?.discordServerId,
      channels: selected.discord.map((ch) => ch.value),
      after: afterDate,
    };
    await fetch(`${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/harvest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    setTimeout(() => setIsCollecting(false), 1200);
  };
  const getStartDateFromRange = (range: string): string => {
    const date = new Date();
    switch (range) {
      case "last-day":
        date.setDate(date.getDate() - 1);
        break;
      case "last-week":
        date.setDate(date.getDate() - 7);
        break;
      case "last-month":
        date.setMonth(date.getMonth() - 1);
        break;
      default:
        break;
    }
    return date.toISOString();
  };
  // ============
  // Function: handleToggle
  // ------------
  // DESCRIPTION: Toggle platform collection on/off
  // PARAMS: key: string
  // RETURNS: void
  // ============
  function handleToggle(key: string) {
    console.log(key);
    setEnabled((e) => ({ ...e, [key]: !e[key as keyof typeof e] }));
    if (key === "discord") {
      // discordAuth();
    }
  }
  const fetchChannels = async (guildId: string) => {
    console.log("fetchChannelllss");
    try {
      const data = await fetch(
        `${process.env.NEXT_PUBLIC_ANALYSER_URL}/discord/channels/${guildId}`,
        {
          method: "GET",
        }
      );
      // console.log("data", data);
      const harvest: DiscordHarvestJob & {
        lastFetched: {
          date: Date;
          channels: Array<{ name: string; qty: number }>;
        };
      } = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/discord/last-harvest/${guildId}`
      ).catch((err) => console.error(err));
      const info: {
        server_id: string;
        server_name: string;
        channels: { id: string; name: string }[];
      } = await data.json();

      const options: Array<{ label: string; value: string }> = [];
      if (Array.isArray(info.channels)) {
        for (const channel of info.channels) {
          options.push({ label: `#${channel.name}`, value: channel.id });
        }
      }
      setPlatforms((prev) =>
        prev.map((platform) =>
          platform.key === "discord"
            ? {
                ...platform,
                options: options,
                account: {
                  id: info.server_id,
                  name: info.server_name,
                  connected: user.discordId != "",
                },
                lastFetched: harvest?.lastFetched || {
                  date: null,
                  channels: [],
                },
              }
            : platform
        )
      );
      setChannelFetched(true);
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
  }, [activeCommunity]);

  useEffect(() => {
    //Si l'url contient ?connect=true alors on ouvre la modal
    if (window.location.search.includes("connect=true")) {
      setOpen("discord");
    }
    //Si l'url contient ?manageIntegrations=true alors on ouvre la modal
    if (window.location.search.includes("manageIntegrations=true")) {
      setManageIntegrationsOpen(true);
    }
  }, []);

  useEffect(() => {
    console.log("platforms", platforms);
  }, [platforms]);
  return (
    <section className="w-full flex flex-col gap-8 p-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="text-2xl font-bold">Data Collection Setup</h1>
        <div className="flex items-center gap-2 text-primary font-medium text-base">
          <Info className="w-5 h-5 text-blue-500" />
          Configure which platforms to collect data from. Only public data is
          collected.
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {platforms.map((platform) => {
          const isDisabled = !enabled[platform.key as keyof typeof enabled];
          return (
            <Card
              key={platform.key}
              className="flex flex-col gap-4 p-6 border shadow-sm min-w-fit"
            >
              <div className="flex items-center gap-3">
                <SocialIcon
                  url={platform.url}
                  bgColor={platform.color}
                  style={{
                    height: 40,
                    width: 40,
                    filter: isDisabled ? "grayscale(1) opacity(0.5)" : "none",
                  }}
                />
                <div>
                  <h2 className="text-lg font-semibold leading-tight">
                    {platform.name}
                  </h2>
                  <div className="text-xs text-muted-foreground">
                    {platform.type.charAt(0).toUpperCase() +
                      platform.type.slice(1)}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Switch
                    checked={enabled[platform.key as keyof typeof enabled]}
                    onCheckedChange={() => handleToggle(platform.key)}
                    aria-label={`Enable ${platform.name}`}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <Label>Time range</Label>
                  <Select
                    value={timeRange[platform.key as keyof typeof timeRange]}
                    onValueChange={(val) =>
                      setTimeRange((r) => ({ ...r, [platform.key]: val }))
                    }
                  >
                    <SelectTrigger
                      aria-label="Select time range"
                      className="w-64"
                    >
                      <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last-day">Last day</SelectItem>
                      <SelectItem value="last-week">Last week</SelectItem>
                      <SelectItem value="last-month">Last month</SelectItem>
                      {/* <SelectItem value="custom">Custom</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Date</Label>
                  <div
                    className={`w-64 ${timeRange[platform.key as keyof typeof timeRange] !== "custom" ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {/* <DatePickerDemo
                      date={dates[platform.key as keyof typeof dates]}
                      setDate={d => setDates(ds => ({ ...ds, [platform.key]: d }))}
                    /> */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-64 justify-start text-left font-normal",
                            !dates[platform.key as keyof typeof dates] &&
                              "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dates &&
                          dates[platform.key as keyof typeof dates] ? (
                            format(
                              dates[platform.key as keyof typeof dates] || "",
                              "PPP"
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dates[platform.key as keyof typeof dates]}
                          onSelect={(d: any) =>
                            setDates((ds: any) => ({
                              ...ds,
                              [platform.key]: d,
                            }))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label>
                    {platform.type.charAt(0).toUpperCase() +
                      platform.type.slice(1)}
                  </Label>
                  {channelFetched ? (
                    <>
                      <div className="w-64">
                        <MultiSelect
                          options={platform.options}
                          // value={selected[platform.key as keyof typeof selected]}
                          onChange={(vals) =>
                            setSelected((s: any) => ({
                              ...s,
                              [platform.key]: vals,
                            }))
                          }
                          placeholder={`Select ${platform.type}...`}
                          // label={undefined}
                          // disabled={isDisabled}
                        />
                      </div>

                      <div className="text-xs text-muted-foreground mt-1">
                        Last fetched:{" "}
                        <span className="font-semibold text-foreground">
                          {new Date(
                            platform.lastFetched.date
                          ).toLocaleDateString()}
                        </span>
                        <br />
                        {platform.lastFetched.channels.map((channel, id) => (
                          <span key={id}>
                            {channel.name} - {channel.qty} message
                            {channel.qty > 1 && "s"} téléchargé
                            {channel.qty > 1 && "s"}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div>
                      <Spinner size="small" />
                    </div>
                  )}
                  {/* </div> */}
                </div>
                <div className="flex flex-row items-center justify-between gap-2 mt-4">
                  <PlatformSettingsDialog
                    open={open === platform.key}
                    setOpen={(isOpen) => {
                      if (isOpen) {
                        setOpen(platform.key);
                      } else {
                        setOpen(null);
                      }
                    }}
                    manageIntegrationsOpen={manageIntegrationsOpen}
                    setManageIntegrationsOpen={setManageIntegrationsOpen}
                    platform={{
                      key: platform.key,
                      name: platform.name,
                      url: platform.url,
                      urlAuth: platform.urlAuth,
                      color: platform.color,
                      type: platform.type,
                      options: platform.options,
                      accountPlatform: platform.account,
                    }}
                    communityId={activeCommunity?.id || 0}
                  />
                  <Button
                    className="flex items-center gap-2 w-32 justify-center"
                    size="sm"
                    onClick={handleCollect}
                    disabled={
                      isCollecting ||
                      isDisabled ||
                      selected[platform.key as keyof typeof selected].length ===
                        0 ||
                      (timeRange[platform.key as keyof typeof timeRange] ===
                        "custom" &&
                        !dates[platform.key as keyof typeof dates])
                    }
                  >
                    <Download className="h-4 w-4" />
                    {isCollecting ? "Collecting..." : "Collect data"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
