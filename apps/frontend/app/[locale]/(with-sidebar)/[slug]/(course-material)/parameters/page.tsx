"use client";

import { useState, useEffect } from "react";

import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Textarea } from "@repo/ui/components/textarea";
import { Slider } from "@repo/ui/components/slider";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { useResource } from "@/hooks/useResources";

import { Info, ListFilter, Lock, Unlock } from "lucide-react";
import { Calendar } from "@repo/ui/components/calendar";
import {
  Calendar as CalendarIcon,
  Clock,
  FileText,
  FileStack,
  Layers,
  DollarSign,
  PiggyBank,
  Users,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function Page() {
  const { data: resource } = useResource("561903247");

  const contributors = resource?.contributors;

  const router = useRouter();
  const { slug } = useParams();
  const [selectedFormat, setSelectedFormat] = useState("");
  const [price, setPrice] = useState(100);
  const [sharePercentage, setSharePercentage] = useState(30);
  const [activeExpertise, setActiveExpertise] = useState("All");
  const [sliders, setSliders] = useState<number[]>(
    contributors?.map(() => 10) || []
  );
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [duration, setDuration] = useState("");
  const [length, setLength] = useState("");
  const [chapters, setChapters] = useState("");
  const [lockedContributors, setLockedContributors] = useState<boolean[]>(
    contributors?.map(() => false) || []
  );
  const [isFormValid, setIsFormValid] = useState(false);

  const toggleLock = (index: number) => {
    const newLocked = [...lockedContributors];
    newLocked[index] = !newLocked[index];
    setLockedContributors(newLocked);
  };

  const redistributeOthers = (index: number, newValue: number) => {
    const totalAvailable = 100;
    const currentValues = [...sliders];
    const oldValue = currentValues[index];
    const delta = newValue - oldValue;

    if (delta === 0) return;

    const otherIndices = currentValues
      .map((_, i) => i)
      .filter((i) => i !== index && !lockedContributors[i]);

    const otherTotal = otherIndices.reduce(
      (acc, i) => acc + currentValues[i],
      0
    );

    const newSliders = [...currentValues];
    newSliders[index] = newValue;

    if (delta > 0) {
      otherIndices.forEach((i) => {
        if (newSliders[i] === 0) return;
        const proportion = newSliders[i] / otherTotal;
        const reduceBy = proportion * delta;
        newSliders[i] = Math.max(0, newSliders[i] - reduceBy);
      });
    } else {
      const positiveDelta = -delta;
      otherIndices.forEach((i) => {
        newSliders[i] +=
          (newSliders[i] / otherTotal || 1 / otherIndices.length) *
          positiveDelta;
      });
    }

    const sum = newSliders.reduce((acc, val) => acc + val, 0);
    const diff = totalAvailable - sum;
    newSliders[index] += diff;

    for (let i = 0; i < newSliders.length; i++) {
      newSliders[i] = Math.max(0, Math.min(100, newSliders[i]));
    }

    setSliders(newSliders);
  };

  const remainingPool = Math.max(0, 100 - sliders.reduce((a, b) => a + b, 0));

  const filteredContributors =
    activeExpertise === "All"
      ? contributors
      : contributors?.filter((c) => c.expertises.includes(activeExpertise));

  const contributorCut = (price * sharePercentage) / 100;
  const creatorCut = price - contributorCut;

  const renderMissing = () => (
    <Badge
      variant="outline"
      className="text-muted-foreground flex items-center gap-1"
    >
      <AlertCircle className="h-3 w-3" />
      Missing
    </Badge>
  );

  useEffect(() => {
    const isValid = !!(
      selectedFormat &&
      (selectedFormat === "Video Course" ? chapters : true) &&
      (selectedFormat === "Guide" || selectedFormat === "Whitepaper"
        ? length
        : true) &&
      (selectedFormat === "Masterclass" || selectedFormat === "Workshop"
        ? date && duration
        : true)
    );
    setIsFormValid(isValid);
  }, [selectedFormat, date, duration, length, chapters]);

  return (
    <>
      <div className="px-6 pt-8 pb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trend to content</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">Apply</Button>
          {/* <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild> */}
          <Button
            size="sm"
            disabled={!isFormValid}
            onClick={() => router.push(`/${slug}/simulate`)}
          >
            Launch
          </Button>
          {/* </TooltipTrigger>
              <TooltipContent>
                <p>Generate content based on the trend</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider> */}
        </div>
      </div>

      <div className="px-6 space-y-6">
        <Tabs defaultValue="All" onValueChange={setActiveExpertise}>
          <TabsList className="space-x-2 w-fit">
            <TabsTrigger value="All">All</TabsTrigger>
            {/* Contributor . expertise */}
            {contributors?.map((contributor) =>
              contributor.expertises.map((expertise) => (
                <TabsTrigger key={expertise} value={expertise}>
                  {expertise}
                </TabsTrigger>
              ))
            )}
          </TabsList>
        </Tabs>

        <div className="rounded-md bg-blue-50 p-4 text-sm text-muted-foreground flex items-start gap-3">
          <Info className="mt-1 h-4 w-4 text-muted-foreground" />
          <span>
            Based on the trend, we've selected the key expertises you might need
            to build this content.
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Parameters</h2>
          <div className="grid md:grid-cols-[1fr_1fr_1.3fr] gap-4">
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle>Content Format</CardTitle>
                <CardDescription>
                  Define the type and structure of the content you want to
                  produce.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Resource Type
                  </label>
                  <Select onValueChange={setSelectedFormat}>
                    <SelectTrigger className="w-full md:w-[450px]">
                      <ListFilter className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select a format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Video Course">Video Course</SelectItem>
                      <SelectItem value="Masterclass">Masterclass</SelectItem>
                      <SelectItem value="Workshop">Workshop session</SelectItem>
                      <SelectItem value="Template">
                        Template instructions
                      </SelectItem>
                      <SelectItem value="Guide">Guide</SelectItem>
                      <SelectItem value="Whitepaper">
                        Whitepaper – Research driven
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(selectedFormat === "Masterclass" ||
                  selectedFormat === "Workshop") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Date
                      </label>
                      <div className="max-w-[180px]">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(d) => setDate(d)}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <label className="text-sm font-medium text-foreground">
                        Duration
                      </label>
                      <Select onValueChange={(val) => setDuration(val)}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30 min</SelectItem>
                          <SelectItem value="60min">1 hour</SelectItem>
                          <SelectItem value="90min">90 min</SelectItem>
                          <SelectItem value="120min">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {(selectedFormat === "Guide" ||
                  selectedFormat === "Whitepaper") && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground mb-2">
                      Estimated Length
                    </label>
                    <Select onValueChange={(val) => setLength(val)}>
                      <SelectTrigger className="w-full md:w-[450px]">
                        <SelectValue placeholder="Select page range" />
                      </SelectTrigger>
                      <SelectContent className="w-full md:w-[450px]">
                        <SelectItem value="5-10">5–10 pages</SelectItem>
                        <SelectItem value="10-20">10–20 pages</SelectItem>
                        <SelectItem value="20-40">20–40 pages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedFormat === "Video Course" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground mb-2">
                      Number of Chapters
                    </label>
                    <Select onValueChange={(val) => setChapters(val)}>
                      <SelectTrigger className="w-full md:w-[450px]">
                        <SelectValue placeholder="Select chapter range" />
                      </SelectTrigger>
                      <SelectContent className="w-full md:w-[450px]">
                        <SelectItem value="5-8">5–8 chapters</SelectItem>
                        <SelectItem value="8-12">8–12 chapters</SelectItem>
                        <SelectItem value="12-20">12–20 chapters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle>Price and Shares Settings</CardTitle>
                <CardDescription>
                  Set up the price and contributor model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Price ($)
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[price]}
                      onValueChange={(val) => setPrice(val[0])}
                      min={0}
                      max={1000}
                      step={1}
                      className="w-2/3"
                    />
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-1/3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Contributors share (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[sharePercentage]}
                      onValueChange={(val) => setSharePercentage(val[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-2/3"
                    />
                    <Input
                      type="number"
                      value={sharePercentage}
                      onChange={(e) =>
                        setSharePercentage(Number(e.target.value))
                      }
                      className="w-1/3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
                <CardDescription>
                  Overview of your content setup and pricing
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-sm text-foreground pt-4">
                {/* LEFT: Content Format */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Content Format
                  </h3>

                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium">
                      {selectedFormat || renderMissing()}
                    </span>
                  </div>

                  {(selectedFormat === "Masterclass" ||
                    selectedFormat === "Workshop") && (
                    <>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">
                          {date ? date.toLocaleDateString() : renderMissing()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">
                          {duration
                            ? duration === "30min"
                              ? "30 min"
                              : duration === "60min"
                                ? "1 hour"
                                : duration === "90min"
                                  ? "1h30"
                                  : duration === "120min"
                                    ? "2 hours"
                                    : duration
                            : renderMissing()}
                        </span>
                      </div>
                    </>
                  )}

                  {(selectedFormat === "Guide" ||
                    selectedFormat === "Whitepaper") && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Length:</span>
                      <span className="font-medium">
                        {length || renderMissing()}
                      </span>
                    </div>
                  )}

                  {selectedFormat === "Video Course" && (
                    <div className="flex items-center gap-2">
                      <FileStack className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Chapters:</span>
                      <span className="font-medium">
                        {chapters || renderMissing()}
                      </span>
                    </div>
                  )}
                </div>

                {/* RIGHT: Price & Shares */}
                <div className="space-y-3 border rounded-md p-4 bg-muted/10">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Price & Distribution
                  </h3>

                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Price:</span>
                    <span className="text-foreground font-bold text-base">
                      ${price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <PiggyBank className="w-4 h-4 text-green-600" />
                    <span className="text-muted-foreground">Creator Cut:</span>
                    <span className="text-green-600 font-semibold text-base">
                      ${creatorCut.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-muted-foreground">
                      Contributors Cut:
                    </span>
                    <span className="text-blue-600 font-semibold text-base">
                      ${contributorCut.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-10">
          <h2 className="text-lg font-semibold">Contributors and Missions</h2>
          {filteredContributors?.map((user, index) => (
            <div key={user.id} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <Card className="md:w-1/3 bg-muted/10">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <Avatar className="mb-4">
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-lg mb-1">{user.id}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {user.title}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user.description}
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {user.expertises.map((exp) => (
                        <Badge key={exp}>{exp}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:w-2/3">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <div className="font-semibold">Mission & revenue</div>
                      <p className="text-sm text-muted-foreground">
                        What are you expecting and how much is getting
                      </p>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Mission</div>
                      <Textarea placeholder="Explain here what you are expecting from this user in order to create the content with him/her" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      This is a textarea description.
                    </div>
                    <div>
                      <div className="flex items-center justify-between w-full">
                        <label className="text-sm font-medium text-foreground">
                          Contributor share (%)
                        </label>
                      </div>
                      <div className="flex flex-col md:flex-row w-full items-center gap-4">
                        <Slider
                          value={[sliders[index]]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(val) =>
                            !lockedContributors[index] &&
                            redistributeOthers(index, val[0])
                          }
                          className="w-full md:flex-1"
                          disabled={lockedContributors[index]}
                        />
                        <div className="flex items-center gap-2 md:w-fit">
                          <Input
                            type="number"
                            value={sliders[index]}
                            onChange={(e) => {
                              if (!lockedContributors[index]) {
                                const num = Number(e.target.value);
                                redistributeOthers(index, num);
                              }
                            }}
                            className="w-20"
                            disabled={lockedContributors[index]}
                          />
                          <button
                            type="button"
                            onClick={() => toggleLock(index)}
                            className={`flex items-center gap-1 p-2 rounded-md transition-colors ${
                              lockedContributors[index]
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-muted text-foreground hover:bg-muted-foreground/50"
                            }`}
                          >
                            {lockedContributors[index] ? (
                              <>
                                <Lock className="h-4 w-4" />
                                <span>Unlock</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="h-4 w-4" />
                                <span>Lock</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <Badge variant="outline" className="mt-2">
                        {((contributorCut * sliders[index]) / 100).toFixed(2)} $
                        for {sliders[index]}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          <div className="pb-6"></div>
        </div>
      </div>
    </>
  );
}
