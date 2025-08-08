import React from "react";
import {
  Card,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  RadioGroup,
  RadioGroupItem,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from "@repo/ui";

import { CalendarIcon, Loader2Icon } from "lucide-react";
import { PlatformIconButtons } from "../platform-icon-buttons";
import { AnalysisDescription } from "../analysis-description";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { MultiSelect } from "@/components/shared/community/ui/MultiSelect";

// ============
// Types communs
// ============
export interface AnalysisInputBaseProps {
  platforms: any[];
  selectedPlatform: string;
  onSelectPlatform: (v: string) => void;
  scope: "all" | "custom";
  onScopeChange: (v: "all" | "custom") => void;
  discordChannels: { label: string; value: string }[];
  selectedChannels: Array<{ label: string; value: string }>;
  onChannelsChange: (v: Array<{ label: string; value: string }>) => void;
  timeRange: string;
  onTimeRangeChange: (v: string) => void;
  customDate: Date | undefined;
  onCustomDateChange: (date: Date | undefined) => void;
  mode: "Meta-Llama-3_3-70B-Instruct" | "DeepSeek-R1-Distill-Llama-70B";
  onModeChange: (
    v: "Meta-Llama-3_3-70B-Instruct" | "DeepSeek-R1-Distill-Llama-70B"
  ) => void;
  messageCount: number;
  canLaunch: boolean;
  loading: boolean;
  onStart: (channels: Array<string>, model: string, period: string) => void;
  analysisType: "summary" | "trend";
  // Props spécifiques aux trends
  selectedPrompt?: string;
  onPromptChange?: (v: string) => void;
  prompts?: any[];
  promptsLoading?: boolean;
}

// ============
// Function: AnalysisInputBase
// ------------
// DESCRIPTION: Composant de base réutilisable pour les inputs d'analyse (summary et trends)
// PARAMS: AnalysisInputBaseProps
// RETURNS: JSX.Element
// ============
export function AnalysisInputBase({
  platforms,
  selectedPlatform,
  onSelectPlatform,
  scope,
  onScopeChange,
  discordChannels,
  selectedChannels,
  onChannelsChange,
  timeRange,
  onTimeRangeChange,
  customDate,
  onCustomDateChange,
  mode,
  onModeChange,
  messageCount,
  canLaunch,
  loading,
  onStart,
  analysisType,
  selectedPrompt,
  onPromptChange,
  prompts,
  promptsLoading,
}: AnalysisInputBaseProps) {
  // Fake videos for YouTube select
  const fakeYoutubeVideos = [
    { label: "Intro to Voting", value: "vid1" },
    { label: "Community AMA", value: "vid2" },
    { label: "Feature Update", value: "vid3" },
  ];
  const [selectedYoutubeVideos, setSelectedYoutubeVideos] = React.useState<
    Array<{ label: string; value: string }>
  >([]);

  const getMessageCountText = () => {
    if (selectedPlatform === "youtube") {
      return messageCount > 0
        ? `${messageCount.toLocaleString()} comments to be analyzed`
        : "No comments to analyze";
    }
    return messageCount > 0
      ? `${messageCount.toLocaleString()} messages to be analyzed`
      : "No messages to analyze";
  };

  const getButtonText = () => {
    return analysisType === "summary" ? "Start Summary" : "Start Analysis";
  };

  return (
    <div className="bg-muted rounded-xl shadow p-6 flex flex-col gap-10">
      {/* 1. Platform selection with icons */}
      <PlatformIconButtons
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={onSelectPlatform}
      />

      {/* 2. Scope of analysis */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">
          Scope of analysis
        </Label>
        {selectedPlatform === "discord" && (
          <RadioGroup
            value={scope}
            onValueChange={(v: string) => onScopeChange(v as "all" | "custom")}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All channels (entire server)</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Select specific channels</Label>
              </div>
              {scope === "custom" && (
                <div className="mt-2">
                  <div className="w-64">
                    <MultiSelect
                      options={discordChannels}
                      value={selectedChannels}
                      onChange={onChannelsChange}
                      placeholder="Select channels..."
                    />
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        {selectedPlatform === "youtube" && (
          <RadioGroup
            value={scope}
            onValueChange={(v: string) => onScopeChange(v as "all" | "custom")}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">Full channel</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Select specific videos</Label>
              </div>
              {scope === "custom" && (
                <div className="mt-2">
                  <div className="w-64">
                    <MultiSelect
                      options={fakeYoutubeVideos}
                      value={selectedYoutubeVideos}
                      onChange={setSelectedYoutubeVideos}
                      placeholder="Select videos..."
                    />
                  </div>
                </div>
              )}
            </div>
          </RadioGroup>
        )}
        {selectedPlatform !== "discord" && selectedPlatform !== "youtube" && (
          <div className="text-muted-foreground text-sm">
            No scope options for this platform.
          </div>
        )}
        <div className="mt-4">
          <Badge variant={messageCount > 0 ? "default" : "destructive"}>
            {getMessageCountText()}
          </Badge>
        </div>
      </Card>

      {/* 3. Time range */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">Time range</Label>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last_day">Last day</SelectItem>
            <SelectItem value="last_week">Last week</SelectItem>
            <SelectItem value="last_month">Last month</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        {timeRange === "custom" && (
          <div className="mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-64 justify-start text-left font-normal",
                    customDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {customDate ? (
                    format(customDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={onCustomDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </Card>

      {/* 4. Mode selection */}
      <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
        <Label className="block mb-3 text-base font-semibold">Mode</Label>
        <RadioGroup
          value={mode}
          onValueChange={(v: string) =>
            onModeChange(
              v as
                | "Meta-Llama-3_3-70B-Instruct"
                | "DeepSeek-R1-Distill-Llama-70B"
            )
          }
          className="flex flex-row gap-6"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="Meta-Llama-3_3-70B-Instruct" id="standard" />
            <Label htmlFor="standard">Standard</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem
              value="DeepSeek-R1-Distill-Llama-70B"
              id="reasoning"
            />
            <Label htmlFor="reasoning">Reasoning</Label>
          </div>
        </RadioGroup>
      </Card>

      {/* 5. Prompt selection (uniquement pour trends) */}
      {analysisType === "trend" &&
        selectedPrompt !== undefined &&
        onPromptChange &&
        prompts &&
        promptsLoading !== undefined && (
          <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
            <Label className="block mb-3 text-base font-semibold">
              Analysis Type
            </Label>
            {promptsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading prompts...
                </span>
              </div>
            ) : (
              <Select value={selectedPrompt} onValueChange={onPromptChange}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(prompts) &&
                    prompts.map((prompt) => (
                      <SelectItem key={prompt.name} value={prompt.name}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {prompt.name.replace(/_/g, " ")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {prompt.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </Card>
        )}

      <AnalysisDescription type={analysisType} />

      {/* 6. Launch button */}
      <div className="pt-2">
        <Button
          className="w-full px-8"
          aria-label={`Start ${analysisType} analysis`}
          size="lg"
          disabled={!canLaunch || loading}
          onClick={() =>
            onStart(
              selectedChannels.map((ch) => ch.value),
              mode,
              timeRange
            )
          }
        >
          {loading ? (
            <>
              <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />
              Please wait
            </>
          ) : (
            getButtonText()
          )}
        </Button>
      </div>
    </div>
  );
}
