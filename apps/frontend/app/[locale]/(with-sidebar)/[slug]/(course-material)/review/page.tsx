"use client";

import { useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import { Card, CardContent } from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Info,
  ExternalLink,
  DollarSign,
  CheckCircle,
  XCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useResource } from "@/hooks/useResources";
import { useTranslations } from "next-intl";

interface RevenueIncreaseRequest {
  currentShare: number;
  requestedShare: number;
  currentCut: number;
  projectedCut: number;
  justification: string;
}

export default function ReviewingPage() {
  const { data: resource } = useResource("561903247");
  const contributors = resource?.contributors || [];
  const router = useRouter();
  const { slug } = useParams();
  const [activeExpertise, setActiveExpertise] = useState("All");
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const MIN_FEEDBACK_LENGTH = 50;

  const [decisions, setDecisions] = useState<
    Record<string, "accepted" | "declined" | null>
  >({
    "User 1": null,
    "User 2": null,
    "User 3": null,
  });

  const [editFile, setEditFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("review");

  const handleFeedbackChange = (id: string, text: string) => {
    setFeedbacks((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const isFeedbackValid = (id: string) => {
    return (feedbacks[id] || "").trim().length >= MIN_FEEDBACK_LENGTH;
  };

  const filteredContributors =
    activeExpertise === "All"
      ? contributors
      : contributors.filter((c) => c.expertises.includes(activeExpertise));

  const handleValidate = (id: string) => {
    setDecisions((prev) => ({ ...prev, [id]: "accepted" }));
  };

  const handleDeny = (id: string) => {
    setDecisions((prev) => ({ ...prev, [id]: "declined" }));
  };

  const handleAcceptRevenueIncrease = (id: string) => {
    console.log(`Revenue increase accepted for ${id}`);
  };

  const handleRejectRevenueIncrease = (id: string) => {
    console.log(`Revenue increase rejected for ${id}`);
  };

  const [decision, setDecision] = useState<string | null>(null);

  const handleAcceptDecision = (id: string) => {
    setDecision("accepted");
    handleAcceptRevenueIncrease(id);
  };

  const handleRejectDecision = (id: string) => {
    setDecision("rejected");
    handleRejectRevenueIncrease(id);
  };

  const allAccepted =
    Object.values(decisions).filter(Boolean).length === contributors.length &&
    Object.values(decisions).every((d) => d === "accepted");

  return (
    <>
      <div className="px-6 pt-8 pb-10 space-y-10">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <Tabs defaultValue="All" onValueChange={setActiveExpertise}>
          <TabsList className="space-x-2 w-fit">
            <TabsTrigger value="All">{t("tabs.all")}</TabsTrigger>

            {contributors.map((c) =>
              c.expertises.map((e) => (
                <TabsTrigger key={e} value={e}>
                  {e}
                </TabsTrigger>
              ))
            )}
          </TabsList>
        </Tabs>

        <Card className="bg-blue-50">
          <CardContent className="p-4 text-sm text-muted-foreground flex items-start gap-3">
            <Info className="mt-1 h-4 w-4 text-muted-foreground" />
            <span>{t("info")}</span>
          </CardContent>
        </Card>

        {filteredContributors.map((user) => (
          <div key={user.id} className="flex flex-col md:flex-row gap-6">
            {/* Contributor Card */}
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

                {decisions[user.id] === "accepted" && (
                  <Badge
                    className="mt-4 bg-green-600 text-white"
                    variant="default"
                  >
                    {t("accepted")}
                  </Badge>
                )}
                {decisions[user.id] === "declined" && (
                  <Badge className="mt-4" variant="destructive">
                    {t("refused")}
                  </Badge>
                )}

                {user.revenueIncreaseRequest && (
                  <Card className="border w-full mt-6">
                    {/* Green bar on top */}
                    <div className="h-1 rounded-t bg-green-600" />

                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-700" />
                        <span className="text-sm font-semibold text-green-800 uppercase tracking-wide">
                          {t("revenue.requested")}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {t("revenue.currentShare")}
                          </span>
                          <div className="text-lg font-semibold text-foreground">
                            {user.revenueIncreaseRequest.currentShare}%
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {t("revenue.requestedShare")}
                          </span>
                          <div className="text-lg font-semibold text-green-700">
                            {user.revenueIncreaseRequest.requestedShare}%
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {t("revenue.currentCut")}
                          </span>
                          <div className="text-lg font-semibold text-foreground">
                            ${user.revenueIncreaseRequest.currentCut.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center space-y-1">
                          <span className="text-muted-foreground whitespace-nowrap">
                            {t("revenue.projectedCut")}
                          </span>
                          <div className="text-lg font-semibold text-green-700">
                            $
                            {user.revenueIncreaseRequest.projectedCut.toFixed(
                              2
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted p-3 rounded text-xs text-muted-foreground italic">
                        <span className="not-italic font-semibold">
                          {t("revenue.justification")}
                        </span>{" "}
                        "{user.revenueIncreaseRequest.justification}"
                      </div>

                      {decision === null && (
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectDecision(user.id)}
                          >
                            {t("revenue.reject")}
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleAcceptDecision(user.id)}
                          >
                            {t("revenue.accept")}
                          </Button>
                        </div>
                      )}

                      {decision === "accepted" && (
                        <div className="flex items-center gap-2 text-green-700 text-sm font-medium mt-2">
                          <CheckCircle className="h-4 w-4" />
                          {t("revenue.accepted")}
                        </div>
                      )}

                      {decision === "rejected" && (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-medium mt-2">
                          <XCircle className="h-4 w-4" />
                          {t("revenue.rejected")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Mission Review Card */}
            <Card className="md:w-2/3 border border-muted">
              <CardContent className="p-6 space-y-4">
                {/* Abstract */}
                <div className="space-y-2">
                  <div className="text-sm font-semibold">
                    {t("mission.abstract")}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("mission.synthesis")}
                  </p>
                  <Textarea
                    placeholder={t("mission.synthesisPlaceholder")}
                    value={user.synthesis}
                    disabled
                  />
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("feedback.label")}
                  </label>
                  <Textarea
                    placeholder={t("feedback.placeholder")}
                    value={feedbacks[user.id] || ""}
                    onChange={(e) =>
                      handleFeedbackChange(user.id, e.target.value)
                    }
                    className={`${
                      !isFeedbackValid(user.id) &&
                      feedbacks[user.id]?.length > 0
                        ? "border border-red-500"
                        : ""
                    }`}
                  />
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span
                      className={`${
                        isFeedbackValid(user.id)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {feedbacks[user.id]?.length || 0} / {MIN_FEEDBACK_LENGTH}{" "}
                      {t("feedback.characters")}
                    </span>
                    {!isFeedbackValid(user.id) &&
                      feedbacks[user.id]?.length > 0 && (
                        <span className="text-red-600">
                          {t("feedback.min")}
                        </span>
                      )}
                  </div>
                </div>

                {/* External Link */}
                <div className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground cursor-pointer underline">
                    {t("mission.link")}
                  </span>
                </div>

                {/* Validation buttons */}
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeny(user.id)}
                    disabled={
                      !isFeedbackValid(user.id) || decisions[user.id] !== null
                    }
                  >
                    {t("deny")}
                  </Button>
                  <Button
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => handleValidate(user.id)}
                    disabled={
                      !isFeedbackValid(user.id) || decisions[user.id] !== null
                    }
                  >
                    {t("accept")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}

        {allAccepted && (
          <div className="mt-12 p-8 border rounded-lg bg-muted/10 flex flex-col items-center gap-6">
            <h2 className="text-xl font-bold mb-2">{t("sale.title")}</h2>
            <p className="text-center mb-4">{t("sale.description")}</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {editFile ? editFile.name : t("sale.upload")}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setEditFile(e.target.files?.[0] || null)}
            />
            <Button
              className="w-64"
              disabled={!editFile}
              onClick={() => {
                toast.success(t("sale.success"));
                setTimeout(() => {
                  router.push(`/${slug}/global/resources/561903247`);
                }, 2000);
              }}
            >
              {t("sale.button")}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
