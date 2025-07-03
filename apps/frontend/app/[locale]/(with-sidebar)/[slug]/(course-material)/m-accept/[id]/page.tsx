"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@repo/ui/components/card";

import {
  Layers,
  Calendar,
  Clock,
  FileText,
  FileStack,
  DollarSign,
  Percent,
  PiggyBank,
  Info,
  ExternalLink,
} from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { useParams, useRouter } from "next/navigation";
import { useResource } from "@/hooks/useResources";

type FormatType =
  | "Masterclass"
  | "Workshop"
  | "Guide"
  | "Whitepaper"
  | "Video Course";

type DurationType = "30min" | "60min" | "90min" | "120min";

const displayDuration = (d: DurationType) => {
  switch (d) {
    case "30min":
      return "30 min";
    case "60min":
      return "1 hour";
    case "90min":
      return "1h30";
    case "120min":
      return "2 hours";
    default:
      return d;
  }
};

// const otherContributors = [
//   { id: "u1", name: "Alice", role: "Designer", cut: 5 },
//   { id: "u2", name: "Bob", role: "Editor", cut: 8 },
//   { id: "u3", name: "Eve", role: "Proofreader", cut: 7 },
// ];

export default function MissionReceptionPage() {
  // Récupère l'id du contributor dans l'URL
  const { id } = useParams();
  // On suppose que la ressource whitepaper a l'id "561903247"
  const { data: resource } = useResource("561903247");
  const router = useRouter();
  const { slug } = useParams();

  // Cherche le contributor correspondant à l'id dans l'URL
  const contributor = resource?.contributors.find((c) => c.userId === id);
  const mission = contributor?.mission;
  const otherContributors = resource?.contributors.filter(
    (c) => c.userId !== id
  );

  // Fallback si pas trouvé
  if (!contributor || !mission || !resource) {
    return (
      <div className="p-10 text-center text-red-600">
        Contributor introuvable ou mission non définie.
      </div>
    );
  }

  // On utilise les données de mission du contributor
  const selectedFormat = resource.format;
  const missionDescription = mission.missionDescription;
  const date = resource.date;
  const duration =
    (["30min", "60min", "90min", "120min"].includes(mission.duration || "")
      ? (mission.duration as DurationType)
      : undefined) || "60min";
  const length = mission.length;
  const chapters = mission.chapters;
  const price = resource.price;
  const contributorShare = contributor.sharePct;
  const contributorCut = (price * contributorShare) / 100;

  const handleAccept = () => {
    router.push(`/${slug}/simulate`);
  };

  const handleDecline = () => {
    console.log("Mission declined!");
  };

  const renderMissing = () => (
    <Badge
      variant="outline"
      className="text-muted-foreground flex items-center gap-1"
    >
      Missing
    </Badge>
  );

  return (
    <>
      <div className="px-6 pt-8 pb-10 space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mission details</h1>
          <div className="flex gap-4">
            <Button variant="outline" onClick={handleDecline}>
              Decline mission
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handleAccept}
            >
              Accept mission
            </Button>
          </div>
        </div>

        {/* ✅ Mission description */}
        <Card className="bg-muted/10">
          <CardHeader>
            <CardTitle>Mission description</CardTitle>
            <CardDescription>
              Details of the expected deliverable.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {missionDescription}
            </p>
          </CardContent>
        </Card>

        {/* Mission origin and trend info */}
        <Card className="w-full bg-muted/20">
          <CardHeader>
            <CardTitle>Trend & mission origin</CardTitle>
            <CardDescription>
              This trend triggered the creation of this mission.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trend Title</label>
              <Input value="Mastering Web3 UX" disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trend Description</label>
              <Textarea
                value="This mission comes from the trend analysis detecting a surge of interest in Web3 user experience and educational materials."
                disabled
              />
            </div>
            <Card className="bg-blue-50">
              <CardContent className="p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5" />
                  <span>
                    These insights come from recent trend analyses. This helps
                    explain why this content is needed.
                  </span>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Outlines from the trend */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-muted/10">
              <CardContent className="p-4 space-y-2">
                <div className="text-sm font-medium">Outline {i} title</div>
                <Input value={`Outline ${i} - Example Title`} disabled />
                <span className="text-xs text-muted-foreground">
                  Quick summary of outline {i}
                </span>
                <Textarea
                  value={`Detailed description of outline ${i}`}
                  disabled
                />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Resources you may check */}
        <div className="flex flex-col justify-center items-center min-h-[180px] space-y-6">
          <h2 className="uppercase text-sm tracking-wider font-bold text-center">
            Resources you may check
          </h2>
          <div className="space-y-3 text-sm">
            {[
              "Title of resource 1",
              "Title of resource 2",
              "Title of resource 3",
            ].map((title, index) => (
              <div
                key={index}
                className="flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                <span tabIndex={0} aria-label={title}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Content Format Card */}
          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle>Content Format</CardTitle>
              <CardDescription>
                Details of the content you are expected to produce.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Resource Type:</span>
                <span className="font-medium">{selectedFormat}</span>
              </div>

              {["Masterclass", "Workshop"].includes(selectedFormat) && (
                <>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {date || renderMissing()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {displayDuration(duration)}
                    </span>
                  </div>
                </>
              )}

              {["Guide", "Whitepaper"].includes(selectedFormat) && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Estimated Length:
                  </span>
                  <span className="font-medium">{length} pages</span>
                </div>
              )}

              {selectedFormat === ("Video Course" as FormatType) && (
                <div className="flex items-center gap-2">
                  <FileStack className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Number of Chapters:
                  </span>
                  <span className="font-medium">{chapters}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ✅ Revenue Sharing Card (Contributeur view) */}
          <Card className="w-full bg-muted/20">
            <CardHeader>
              <CardTitle>Revenue Sharing (Your share)</CardTitle>
              <CardDescription>
                Here's your revenue for each sale of the produced content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Content price:
                  </span>
                </div>
                <span className="text-base font-semibold text-foreground">
                  ${price}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Your share:
                  </span>
                </div>
                <span className="text-base font-semibold text-blue-600">
                  {contributorShare} %
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <PiggyBank className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Your cut per sale:
                  </span>
                </div>
                <span className="text-base font-semibold text-green-600">
                  ${contributorCut.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Other contributors Card */}
          <Card className="w-full bg-muted/20">
            <CardHeader>
              <CardTitle>Other contributors</CardTitle>
              <CardDescription>
                Here's who else is working on this content and their revenue
                share.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {otherContributors &&
                otherContributors.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center border-b border-border pb-2 last:border-none"
                  >
                    <div>
                      <span className="block font-medium">{c.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {c.description}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-blue-600">
                      {c.sharePct} %
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>

        {/* ✅ Action buttons */}
        <div className="flex justify-end gap-4"></div>
      </div>
    </>
  );
}
