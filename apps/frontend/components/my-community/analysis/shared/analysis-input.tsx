import React, { useState } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@repo/ui";
import {
  CalendarIcon,
  Loader2Icon,
  SparklesIcon,
  BrainIcon,
  TrendingUpIcon,
  HelpCircle,
  PlusIcon,
  UserIcon,
  GlobeIcon,
} from "lucide-react";
import { PlatformIconButtons } from "./platform-icon-buttons";
import { AnalysisDescription } from "./analysis-description";
import { cn } from "@workspace/ui/lib/utils";
import { format } from "date-fns";
import { MultiSelect } from "@/components/shared/community/ui/MultiSelect";
import { SimplePromptBuilder } from "../../../admin/prompts/SimplePromptBuilder";

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
  // Nouvelle approche : sélection directe de prompts
  selectedPrompt?: string;
  onPromptChange?: (v: string) => void;
  prompts?: any[];
  promptsLoading?: boolean;
  // Gestion de la création de prompts personnalisés
  onPromptCreated?: (prompt: any) => void;
}

// ============
// Function: AnalysisInput
// ------------
// DESCRIPTION: Composant de base réutilisable pour les inputs d'analyse avec sélection de prompts
// PARAMS: AnalysisInputBaseProps
// RETURNS: JSX.Element
// ============
export function AnalysisInput({
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
  selectedPrompt,
  onPromptChange,
  prompts,
  promptsLoading,
  onPromptCreated,
}: AnalysisInputBaseProps) {
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
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
    return "Start Analysis";
  };

  // Fonction pour obtenir l'icône et la couleur selon le type de prompt
  const getPromptIcon = (promptName: string) => {
    const name = promptName.toLowerCase();
    if (name.includes("summary") || name.includes("résumé")) {
      return { icon: BrainIcon, color: "text-blue-600", bgColor: "bg-blue-50" };
    } else if (name.includes("trend") || name.includes("tendance")) {
      return {
        icon: TrendingUpIcon,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    } else {
      return {
        icon: SparklesIcon,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      };
    }
  };

  // Filtrer et préparer les prompts
  const availablePrompts = prompts
    ? prompts.filter((p) => !p.name.toLowerCase().includes("trend_to_content"))
    : [];

  return (
    <div className="bg-muted rounded-xl shadow p-6 flex flex-col gap-10">
      {/* 1. Platform selection with icons */}
      <PlatformIconButtons
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={onSelectPlatform}
      />

      {/* 2. Analysis Type Selection - Deuxième étape */}
      {selectedPrompt !== undefined &&
        onPromptChange &&
        prompts &&
        promptsLoading !== undefined && (
          <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Label className="text-base font-semibold">Analysis Type</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[300px] p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">
                        What does the AI do?
                      </h4>
                      <ul className="text-xs space-y-1">
                        <li>• Extracts key topics and their summaries</li>
                        <li>• Highlights most active/influential users</li>
                        <li>• Identifies trending discussions and patterns</li>
                        <li>
                          • Provides actionable insights for community
                          management
                        </li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {promptsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2Icon className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Loading prompts...
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {selectedPrompt ? (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const {
                              icon: Icon,
                              color,
                              bgColor,
                            } = getPromptIcon(selectedPrompt);
                            return (
                              <div className={cn("p-1 rounded", bgColor)}>
                                <Icon className={cn("h-3 w-3", color)} />
                              </div>
                            );
                          })()}
                          <span className="truncate">
                            {availablePrompts
                              .find((p) => p.name === selectedPrompt)
                              ?.name.replace(/_/g, " ") ||
                              "Select analysis type"}
                          </span>
                        </div>
                      ) : (
                        "Select analysis type"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search analysis types..." />
                      <CommandList className="max-h-[400px]">
                        <CommandEmpty>No analysis type found.</CommandEmpty>

                        {/* Grouper les prompts par type */}
                        {(() => {
                          const ownPrompts = availablePrompts.filter(
                            (p: any) => p.is_own
                          );
                          const publicPrompts = availablePrompts.filter(
                            (p: any) => p.is_public && !p.is_own
                          );

                          return (
                            <>
                              {/* Mes prompts */}
                              {ownPrompts.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 sticky top-0">
                                    <div className="flex items-center gap-1">
                                      <UserIcon className="w-3 h-3" />
                                      Mes prompts ({ownPrompts.length})
                                    </div>
                                  </div>
                                  {ownPrompts.map((prompt: any) => {
                                    const {
                                      icon: Icon,
                                      color,
                                      bgColor,
                                    } = getPromptIcon(prompt.name);

                                    return (
                                      <CommandItem
                                        key={prompt.name}
                                        value={prompt.name}
                                        onSelect={() =>
                                          onPromptChange(prompt.name)
                                        }
                                        className="flex items-start gap-3 p-3 cursor-pointer bg-blue-50 border-l-4 border-l-blue-500"
                                      >
                                        <div
                                          className={cn(
                                            "p-2 rounded-md mt-0.5",
                                            bgColor
                                          )}
                                        >
                                          <Icon
                                            className={cn("h-4 w-4", color)}
                                          />
                                        </div>
                                        <div className="flex flex-col flex-1 min-h-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm leading-tight">
                                              {prompt.name.replace(/_/g, " ")}
                                            </span>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                              <UserIcon className="w-3 h-3" />
                                              Personnel
                                            </div>
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {prompt.description}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </>
                              )}

                              {/* Prompts publics */}
                              {publicPrompts.length > 0 && (
                                <>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-green-600 bg-green-50 sticky top-0">
                                    <div className="flex items-center gap-1">
                                      <GlobeIcon className="w-3 h-3" />
                                      Prompts publics ({publicPrompts.length})
                                    </div>
                                  </div>
                                  {publicPrompts.map((prompt: any) => {
                                    const {
                                      icon: Icon,
                                      color,
                                      bgColor,
                                    } = getPromptIcon(prompt.name);

                                    return (
                                      <CommandItem
                                        key={prompt.name}
                                        value={prompt.name}
                                        onSelect={() =>
                                          onPromptChange(prompt.name)
                                        }
                                        className="flex items-start gap-3 p-3 cursor-pointer"
                                      >
                                        <div
                                          className={cn(
                                            "p-2 rounded-md mt-0.5",
                                            bgColor
                                          )}
                                        >
                                          <Icon
                                            className={cn("h-4 w-4", color)}
                                          />
                                        </div>
                                        <div className="flex flex-col flex-1 min-h-0">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-sm leading-tight">
                                              {prompt.name.replace(/_/g, " ")}
                                            </span>
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                              <GlobeIcon className="w-3 h-3" />
                                              Public
                                            </div>
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                            {prompt.description}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    );
                                  })}
                                </>
                              )}
                            </>
                          );
                        })()}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {/* Bouton pour créer un prompt personnalisé */}
                {onPromptCreated && (
                  <div className="flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => setShowPromptBuilder(true)}
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Créer un prompt personnalisé
                    </Button>
                    <Dialog
                      open={showPromptBuilder}
                      onOpenChange={setShowPromptBuilder}
                    >
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Créer un prompt personnalisé
                          </DialogTitle>
                        </DialogHeader>
                        <SimplePromptBuilder
                          onSubmit={(promptData: any) => {
                            onPromptCreated(promptData);
                            setShowPromptBuilder(false);
                          }}
                          onCancel={() => setShowPromptBuilder(false)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {/* Affichage du prompt sélectionné */}
                {selectedPrompt &&
                  prompts.find((p) => p.name === selectedPrompt) &&
                  (() => {
                    const selectedPromptData = prompts.find(
                      (p) => p.name === selectedPrompt
                    );
                    const isOwn = selectedPromptData?.is_own;
                    const isPublic = selectedPromptData?.is_public && !isOwn;

                    return (
                      <div
                        className={cn(
                          "mt-3 p-3 rounded-lg border",
                          isOwn
                            ? "bg-blue-50 border-blue-200"
                            : "bg-green-50 border-green-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "p-2 rounded-md",
                              isOwn ? "bg-blue-100" : "bg-green-100"
                            )}
                          >
                            {isOwn ? (
                              <UserIcon className="h-4 w-4 text-blue-600" />
                            ) : (
                              <SparklesIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4
                                className={cn(
                                  "font-medium text-sm",
                                  isOwn ? "text-blue-900" : "text-green-900"
                                )}
                              >
                                {selectedPromptData?.name.replace(/_/g, " ")}
                              </h4>
                              {isOwn && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  Mon prompt
                                </span>
                              )}
                              {isPublic && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  Public
                                </span>
                              )}
                            </div>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                isOwn ? "text-blue-700" : "text-green-700"
                              )}
                            >
                              {selectedPromptData?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </div>
            )}
          </Card>
        )}

      {/* 3. Scope of analysis */}
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
      {/* <Card className="w-full max-w-[90%] md:max-w-[95%] self-center py-5 px-4 bg-gray-50 shadow-md">
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
      </Card> */}

      {/* 6. Launch button */}
      <div className="pt-2">
        <Button
          className="w-full px-8"
          aria-label="Start analysis"
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
