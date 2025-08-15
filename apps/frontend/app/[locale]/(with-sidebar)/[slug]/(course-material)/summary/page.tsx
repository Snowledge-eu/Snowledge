"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { User } from "@/types/user";
import {
  Avatar,
  AvatarFallback,
  Button,
  Card,
  CardContent,
  Input,
  Separator,
  Spinner,
  Tabs,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { set } from "date-fns";
import { Info, ExternalLink } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const contributorsData = [
  { id: "AB", expertises: ["e1", "e2"] },
  { id: "SB", expertises: ["e2", "e3"] },
  { id: "NP", expertises: ["e1"] },
];

export default function Page() {
  const { fetcher } = useAuth();
  const { activeCommunity } = useCurrentCommunity();

  const router = useRouter();
  const searchParams = useSearchParams();
  const analysisId = searchParams.get("analysisId");
  const trendId = searchParams.get("trendId");
  const [selectedContributors, setSelectedContributors] = useState<User[]>([]);
  const [contributorsData, setcontributorsData] = useState<
    Array<{ contributors: Array<User>; expertise: string }>
  >([]);
  const [activeExpertise, setActiveExpertise] = useState<string>("all");
  const [outline, setOutline] = useState<
    Array<{ title: string; description: string }>
  >([]);
  const [resources, setResources] = useState<Array<string>>([]);
  const [expertRequired, setExpertRequired] = useState<
    Array<{ title: string; description: string }>
  >([]);
  const [loader, setLoader] = useState(false);
  const fetchSummaryResult = async () => {
    setLoader(true);
    let content;
    const resBackEnd = await fetcher(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/summary/${analysisId}?trendId=${trendId}`,
      {
        method: "GET",
      }
    );
    if (resBackEnd && resBackEnd.data) {
      content = JSON.parse(resBackEnd.data.result.choices[0].message.content);
    } else {
      const trendToContentResponse = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/summary/trend-to-content/${analysisId}?trend_index=${trendId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const trendToContent = trendToContentResponse?.data;

      content = JSON.parse(trendToContent.choices[0].message.content);
    }
    const requiredExpertise = content.required_expertise;
    const uniqueTitles = [
      ...new Set(
        requiredExpertise.map(
          (e: { title: string; description: string }) => e.title
        )
      ),
    ];
    const body = {
      communityId: activeCommunity?.id,
      expertises: uniqueTitles,
    };
    const groupedContributor = await fetcher(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/find-contributor`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    setcontributorsData(groupedContributor?.data);
    setOutline(content.outline);
    setLoader(false);
    setResources(content.recommended_resources);
    setExpertRequired(content.required_expertise);
  };
  useEffect(() => {
    if (analysisId && trendId) {
      fetchSummaryResult();
    }
  }, []);
  const handleSelectContributor = (initials: User) => {
    setSelectedContributors((prev) =>
      prev.includes(initials)
        ? prev.filter((i) => i !== initials)
        : [...prev, initials]
    );
  };

  const filteredContributors =
    activeExpertise === "all"
      ? Array.isArray(contributorsData)
        ? contributorsData
        : []
      : Array.isArray(contributorsData)
        ? contributorsData.filter((c) => c.expertise === activeExpertise)
        : [];

  return (
    <>
      <div className="flex items-center justify-between px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold">Trend to content</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() =>
                  router.push(`/${activeCommunity?.slug}/parameters`)
                }
                size="sm"
              >
                Continue to parameters
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate content based on the trend</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-1 min-h-[calc(100vh-6rem)] flex-col md:flex-row gap-10 px-6 pb-16">
        {loader ? (
          <div className="w-full md:w-3/5 space-y-10">
            <Spinner />
          </div>
        ) : (
          <div className="w-full md:w-3/5 space-y-10">
            {outline.map((line, i) =>
              i === 0 ? (
                <div key={i}>
                  <div className="space-y-3">
                    <label
                      htmlFor="content-title"
                      className="text-base font-semibold"
                    >
                      Content Title
                    </label>
                    <Input id="content-title" placeholder={line.title} />
                  </div>
                  <div className="space-y-3">
                    <label
                      htmlFor="content-description"
                      className="text-base font-semibold"
                    >
                      Description
                    </label>
                    <Textarea
                      id="content-description"
                      placeholder={line.title}
                    />
                  </div>
                </div>
              ) : (
                <div key={i} className="space-y-3">
                  <label
                    htmlFor={`outline-title-${i}`}
                    className="text-base font-semibold"
                  >
                    Outline {i} title
                  </label>
                  <Input id={`outline-title-${i}`} placeholder={line.title} />
                  <span className="text-sm text-muted-foreground">
                    Edit the title if needed
                  </span>
                  <Textarea
                    id={`outline-description-${i}`}
                    placeholder={line.description}
                  />
                </div>
              )
            )}
            <Card className="bg-blue-50">
              <CardContent className="p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  <span>
                    Titles and descriptions are generated based on the trend.
                    Make sure to edit them if needed.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <Separator orientation="vertical" className="hidden md:block" />

        <div className="w-full md:w-2/5 flex flex-col justify-between">
          <div className="flex flex-col gap-12">
            <div className="space-y-4">
              <h2 className="uppercase text-sm tracking-wider font-bold text-center">
                Required expertises
              </h2>
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <span>
                      Based on the trend, we’ve selected the key expertises you
                      might need to build this content.
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Tabs
                defaultValue="all"
                onValueChange={(value) => setActiveExpertise(value)}
              >
                <TabsList className="w-full grid grid-cols-4 h-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  {expertRequired.map((exp, i) => (
                    <TabsTrigger
                      key={i}
                      className="whitespace-normal"
                      value={exp.title}
                    >
                      {exp.title}
                    </TabsTrigger>
                  ))}
                  {/* <TabsTrigger value="e2">Expertise 2</TabsTrigger>
                    <TabsTrigger value="e3">Expertise 3</TabsTrigger> */}
                </TabsList>
              </Tabs>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="uppercase text-sm tracking-wider font-bold text-center">
                Suggested contributors
              </h2>
              <div className="flex justify-center gap-3 flex-wrap">
                {filteredContributors.length > 0 &&
                  filteredContributors.map((contributors) =>
                    contributors.contributors.map((contributor, id) => (
                      <TooltipProvider key={id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar
                              className={`cursor-pointer w-20 h-20 border ${selectedContributors.includes(contributor) ? "border-blue-500" : "border-muted"}`}
                              onClick={() =>
                                handleSelectContributor(contributor)
                              }
                            >
                              <AvatarFallback>
                                {contributor.pseudo.slice(0, 3)}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {contributor.firstname} {contributor.lastname}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))
                  )}
              </div>
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <span>
                      These contributors match the expertises needed for this
                      trend.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="space-y-4">
              <h2 className="uppercase text-sm tracking-wider font-bold text-center">
                Selected contributors
              </h2>
              <div className="flex justify-center gap-3 flex-wrap">
                {selectedContributors.map((initials) => (
                  <Avatar
                    key={initials.pseudo.slice(0, 3)}
                    className="w-20 h-20"
                  >
                    <AvatarFallback>
                      {initials.pseudo.slice(0, 3)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <Card className="bg-blue-50">
                <CardContent className="p-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5" />
                    <span>
                      You’ve selected these contributors to be involved in the
                      content creation.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            <div className="flex flex-col justify-center items-center min-h-[180px] space-y-6">
              <h2 className="uppercase text-sm tracking-wider font-bold text-center">
                Resources you may check
              </h2>
              <div className="space-y-3 text-sm">
                {resources.map((title, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ExternalLink
                      href={title}
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    <span tabIndex={0} aria-label={title}>
                      {title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
