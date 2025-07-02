"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@repo/ui/components/tooltip";
import {
  DollarSign,
  Layers,
  Clock,
  Calendar,
  CalendarPlus,
  Users,
} from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import { useResource } from "@/hooks/useResources";
import { useParams } from "next/navigation";

export default function BuyResourcePage() {
  const { resourcesId } = useParams();
  const {
    data: resource,
    isLoading,
    error,
  } = useResource(resourcesId as string);

  if (isLoading) return <div>Chargement...</div>;
  if (error || !resource)
    return <div>Erreur : {error?.message || "Ressource introuvable"}</div>;

  const {
    title,
    description,
    tags,
    format,
    duration,
    date,
    outlines,
    price,
    creatorSharePct,
    contributorSharePct,
    contributors,
    attendees,
  } = resource;

  return (
    <>
      <div className="px-6 pt-8 pb-10 space-y-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Thumbnail + tags */}
            <Card className="bg-muted/10">
              <CardContent className="p-4 flex flex-col gap-4">
                <div className="h-48 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                  Thumbnail Image
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Format */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Format:
                      </span>
                      <span className="text-sm font-medium">{format}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Duration:
                      </span>
                      <span className="text-sm font-medium">{duration}</span>
                    </div>
                    {format === "Masterclass" && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Date:
                        </span>
                        <span className="text-sm font-medium">{date}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end md:items-center md:flex-row md:gap-4">
                    <span className="text-xs text-muted-foreground">
                      Add to your calendar:
                    </span>
                    <div className="flex gap-2 mt-1 md:mt-0">
                      <div className="p-2 rounded-md bg-muted/20">
                        <CalendarPlus className="w-5 h-5 text-muted-foreground cursor-not-allowed" />
                      </div>
                      <div className="p-2 rounded-md bg-muted/20">
                        <CalendarPlus className="w-5 h-5 text-muted-foreground cursor-not-allowed" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outlines */}
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
                <CardDescription>
                  Explore the structure and chapters of this content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {outlines.map((item, idx) => (
                    <AccordionItem key={idx} value={`item-${idx}`}>
                      <AccordionTrigger>{item.title}</AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* People attending this masterclass */}
            <Card className="bg-muted/10">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  People attending this masterclass
                </CardTitle>
                <CardDescription>
                  Join other learners who are already enrolled and connect with
                  the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  {attendees.slice(0, 8).map((attendee) => (
                    <TooltipProvider key={attendee.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary">
                            <AvatarFallback>{attendee.initials}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span className="text-xs">{attendee.name}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  {attendees.length > 8 && (
                    <span className="text-xs text-muted-foreground">
                      + {attendees.length - 8} more attending
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Transparency on how revenue is distributed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Selling price
                  </span>
                  <span className="text-base font-bold">${price}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-green-600" />
                    Creator cut
                  </span>
                  <span className="text-green-600 font-semibold text-base">
                    ${((price * creatorSharePct) / 100).toFixed(2)} (
                    {creatorSharePct}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-blue-600" />
                    Contributors cut
                  </span>
                  <span className="text-blue-600 font-semibold text-base">
                    ${((price * contributorSharePct) / 100).toFixed(2)} (
                    {contributorSharePct}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Contributors & Revenue Sharing */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Contributors & Revenue Sharing
                </CardTitle>
                <CardDescription>
                  Meet the team behind this content and see how revenue is
                  shared.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contributors.map((contributor) => (
                  <Card
                    key={contributor.id}
                    className="bg-muted/10 border border-border"
                  >
                    <CardContent className="flex flex-col md:flex-row md:items-start gap-4 p-4">
                      <div className="flex flex-col items-center md:items-start md:w-1/3">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted text-foreground font-semibold">
                          {contributor.initials}
                        </div>
                        <div className="mt-2 text-center md:text-left">
                          <div className="font-semibold">
                            {contributor.id} - {contributor.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {contributor.description}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                          {contributor.expertises.map((exp) => (
                            <Badge key={exp}>{exp}</Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center md:w-2/3 text-sm md:items-end">
                        <div className="text-right">
                          <span className="font-medium text-blue-600">
                            {contributor.sharePct} %
                          </span>{" "}
                          <span className="text-muted-foreground">→</span>{" "}
                          <span className="font-medium text-green-600">
                            ${contributor.cut.toFixed(2)} per sale
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-right">
                          Revenue share
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <Button className="w-full">Purchase now</Button>
              <Button variant="outline" className="w-full">
                Return to dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
