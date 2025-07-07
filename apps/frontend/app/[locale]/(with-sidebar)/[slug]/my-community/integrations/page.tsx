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
import { initialPlatforms } from "@/shared/constants/initial-platforms";
import CardPlatform from "@/components/my-community/integrations/card-platform";

export default function Page() {
  const { user, fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();
  const [open, setOpen] = useState<string | null>(null);
  const [manageIntegrationsOpen, setManageIntegrationsOpen] = useState(false);

  const [channelFetched, setChannelFetched] = useState(false);
  const [platforms, setPlatforms] = useState(initialPlatforms);
  const [enabled, setEnabled] = useState({
    discord: true,
    youtube: false,
    x: false,
    instagram: false,
  }); //, youtube: false, x: false
  const [selected, setSelected] = useState({
    discord: [] as Array<{ label: string; value: string }>,
    youtube: [] as Array<{ label: string; value: string }>,
    x: [] as Array<{ label: string; value: string }>,
    instagram: [] as Array<{ label: string; value: string }>,
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
    } else {
      setChannelFetched(true);
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

  useEffect(() => {
    console.log("selected", selected);
  }, [selected]);
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
      <h2>Chat Platform :</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {platforms.map((platform) => {
          const isDisabled = !enabled[platform.key as keyof typeof enabled];
          return (
            platform.cat === "chat" && (
              <CardPlatform
                key={platform.key}
                platform={platform}
                isDisabled={isDisabled}
                isEnabled={enabled[platform.key as keyof typeof enabled]}
                timeRange={timeRange[platform.key as keyof typeof timeRange]}
                setTimeRange={(val) => {
                  console.log("val", val);
                  setTimeRange((r) => ({ ...r, ...val }));
                }}
                dates={dates[platform.key as keyof typeof dates]}
                setDates={(val) => setDates((r) => ({ ...r, ...val }))}
                channelFetched={channelFetched}
                selected={selected[platform.key as keyof typeof selected]}
                setSelected={(val) => {
                  console.log("val", val);
                  setSelected((r) => ({ ...r, ...val }));
                }}
                activeCommunity={activeCommunity}
                handleCollect={handleCollect}
                isCollecting={isCollecting}
              />
            )
          );
        })}
      </div>
      <Separator />

      <h2>Social Network Platform :</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {platforms.map((platform) => {
          const isDisabled = !enabled[platform.key as keyof typeof enabled];
          return (
            platform.cat === "social-network" && (
              <CardPlatform
                key={platform.key}
                platform={platform}
                isDisabled={isDisabled}
                isEnabled={enabled[platform.key as keyof typeof enabled]}
                timeRange={timeRange[platform.key as keyof typeof timeRange]}
                setTimeRange={(val) => setTimeRange((r) => ({ ...r, val }))}
                dates={dates[platform.key as keyof typeof dates]}
                setDates={(val) => setDates((r) => ({ ...r, val }))}
                channelFetched={channelFetched}
                selected={selected[platform.key as keyof typeof selected]}
                setSelected={(val) => setSelected((r) => ({ ...r, val }))}
                activeCommunity={activeCommunity}
                handleCollect={handleCollect}
                isCollecting={isCollecting}
              />
            )
          );
        })}
      </div>
    </section>
  );
}
