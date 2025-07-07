"use client";

import PlatformSettingsDialog from "@/app/[locale]/(with-sidebar)/[slug]/my-community/integrations/settings-dialog";
import { MultiSelect } from "@/components/shared/community/ui/MultiSelect";
import { Platform } from "@/shared/interfaces/IPlatform";
import { Community } from "@/types/community";
import {
  Logo,
  Button,
  Checkbox,
  Input,
  Label,
  Card,
  Switch,
  Separator,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  PopoverTrigger,
  Popover,
  PopoverContent,
  Spinner,
  Calendar,
} from "@repo/ui";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { SocialIcon } from "react-social-icons";
export default function CardPlatform({
  platform,
  isDisabled,
  isEnabled,
  timeRange,
  setTimeRange,
  dates,
  setDates,
  channelFetched,
  setSelected,
  activeCommunity,
  handleCollect,
  selected,
  isCollecting,
}: {
  platform: Platform;
  isDisabled: boolean;
  isEnabled: boolean;
  timeRange: string;
  setTimeRange: (r: { [key: string]: string }) => void;
  dates: Date | undefined;
  setDates: (r: { [key: string]: Date | undefined }) => void;
  channelFetched: boolean;
  selected: Array<{ label: string; value: string }>;
  setSelected: (r: {
    [key: string]: Array<{ label: string; value: string }>;
  }) => void;
  activeCommunity: Community | null;
  handleCollect: () => void;
  isCollecting: boolean;
}) {
  const [enabled, setEnabled] = useState(isEnabled);
  const [open, setOpen] = useState<string | null>(null);
  const [manageIntegrationsOpen, setManageIntegrationsOpen] = useState(false);

  useEffect(() => {
    //Si l'url contient ?connect=true alors on ouvre la modal
    if (
      window.location.search.includes("connect=true") &&
      platform.key === "discord"
    ) {
      setOpen("discord");
    }
    //Si l'url contient ?manageIntegrations=true alors on ouvre la modal
    if (window.location.search.includes("manageIntegrations=true")) {
      setManageIntegrationsOpen(true);
    }
  }, []);

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
            {platform.type.charAt(0).toUpperCase() + platform.type.slice(1)}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            aria-label={`Enable ${platform.name}`}
          />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label>Time range</Label>
          <Select
            value={timeRange}
            onValueChange={(val) => setTimeRange({ [platform.key]: val })}
          >
            <SelectTrigger aria-label="Select time range" className="w-64">
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
            className={`w-64 ${timeRange !== "custom" ? "pointer-events-none opacity-60" : ""}`}
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
                    !dates && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dates && dates ? (
                    format(dates || "", "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dates}
                  onSelect={(d) =>
                    setDates({
                      [platform.key]: d,
                    })
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label>
            {platform.type.charAt(0).toUpperCase() + platform.type.slice(1)}
          </Label>
          {channelFetched ? (
            <>
              <div className="w-64">
                <MultiSelect
                  options={platform.options}
                  // value={selected[platform.key as keyof typeof selected]}
                  onChange={(vals) =>
                    setSelected({
                      [platform.key]: vals,
                    })
                  }
                  placeholder={`Select ${platform.type}...`}
                  // label={undefined}
                  // disabled={isDisabled}
                />
              </div>

              <div className="text-xs text-muted-foreground mt-1">
                Last fetched:{" "}
                <span className="font-semibold text-foreground">
                  {platform.lastFetched.date &&
                  platform.lastFetched.channels.some(
                    (channel) => channel.qty > 0
                  )
                    ? new Date(platform.lastFetched.date).toLocaleDateString()
                    : "Never fetched"}
                </span>
                <br />
                {platform.lastFetched.channels.map((channel, id) => (
                  <span key={id}>
                    {channel.name} - {channel.qty} message
                    {channel.qty > 1 && "s"} downloaded
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
              selected.length === 0 ||
              (timeRange === "custom" && !dates)
            }
          >
            <Download className="h-4 w-4" />
            {isCollecting ? "Collecting..." : "Collect data"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
