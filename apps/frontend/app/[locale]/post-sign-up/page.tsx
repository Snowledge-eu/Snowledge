"use client";

import Link from "next/link";
import { PlusCircle, ArrowLeft } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui";
import { useAllCommunities } from "@/hooks/useAllCommunities";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useMyInvitations } from "@/components/post-sign-up/hooks/useMyInvitations";
import { useAcceptInvitation } from "@/components/post-sign-up/hooks/useAcceptInvitation";
import { useDeclineInvitation } from "@/components/post-sign-up/hooks/useDeclineInvitation";
import { InvitationList } from "@/components/post-sign-up/InvitationList";
import { CommunityJoinForm } from "@/components/post-sign-up/CommunityJoinForm";
import { useState } from "react";

export default function PostSignUp() {
  const { data: communities } = useAllCommunities();
  const t = useTranslations("postSignUp");

  const { data: invitations = [], isLoading, refetch } = useMyInvitations();
  const acceptInvitation = useAcceptInvitation();
  const declineInvitation = useDeclineInvitation();
  const [showResourceInput, setShowResourceInput] = useState(false);
  const [resourceId, setResourceId] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center">
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href="/?no-redirect=true">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex flex-col items-center justify-center">
              <CardTitle className="text-2xl">{t("title")}</CardTitle>
              <CardDescription>{t("description")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="h-16 gap-2 text-lg">
              <Link href="/create-community">
                <PlusCircle className="h-5 w-5" />
                {t("create_button")}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground px-1">
              {t("create_description")}
            </p>
          </div>

          <CommunityJoinForm communities={communities} t={t} />

          <div className="flex flex-col gap-3 mt-4">
            {!showResourceInput ? (
              <Button
                variant="outline"
                onClick={() => setShowResourceInput(true)}
              >
                {t("buy_resource_button")}
              </Button>
            ) : (
              <form
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!resourceId.trim()) {
                    setError(t("buy_resource_error"));
                    return;
                  }
                  setError("");
                  window.location.href = resourceId;
                }}
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder={t("buy_resource_placeholder")}
                    value={resourceId}
                    onChange={(e) => setResourceId(e.target.value)}
                  />
                  <Button type="submit" className="h-10">
                    {t("buy_resource_access")}
                  </Button>
                </div>
                {error && <span className="text-red-600 text-xs">{error}</span>}
              </form>
            )}
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">
              {t("invitations_title")} ({invitations.length})
            </h3>
            <InvitationList
              invitations={invitations}
              isLoading={isLoading}
              onAccept={async (slug) => {
                await acceptInvitation.mutateAsync(slug);
                refetch();
                toast.success(t("invitation_accepted"));
                window.location.href = `/${slug}`;
              }}
              onDecline={async (slug) => {
                await declineInvitation.mutateAsync(slug);
                refetch();
                toast.success(t("invitation_declined"));
              }}
              t={t}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
