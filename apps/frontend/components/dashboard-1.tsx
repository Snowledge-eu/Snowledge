import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { SidebarInset } from "@repo/ui/components/sidebar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import {
  BotMessageSquare,
  BrainCircuit,
  ClipboardCheck,
  KanbanSquare,
  Lightbulb,
  Lock,
  Medal,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users2,
  Vote,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { useTranslations } from "next-intl";

export function Dashboard1() {
  const { activeCommunity } = useCurrentCommunity();
  const { slug } = useParams();
  const t = useTranslations("dashboard");

  const isDiscordConnected = !!activeCommunity?.discordServerId;

  return (
    <div className="min-h-screen">
      <SidebarInset className="flex-1 overflow-hidden">
        <div className="bg-background h-full overflow-auto">
          <div className="p-4 md:p-8 flex flex-col gap-8">
            {/* Section d'accueil */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("description")}
              </p>
            </div>

            <Separator />

            {/* Guide de démarrage rapide OU Actions rapides */}
            {isDiscordConnected ? (
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t("quickActions.title")}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("quickActions.proposal.title")}
                      </CardTitle>
                      <PlusCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {t("quickActions.proposal.subtitle")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("quickActions.proposal.description")}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`${slug}/global/voting/create-topic`}>
                        <Button size="sm">
                          {t("quickActions.proposal.button")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("quickActions.activeCollection.title")}
                      </CardTitle>
                      <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {t("quickActions.activeCollection.subtitle")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("quickActions.activeCollection.description")}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`${slug}/my-community/integrations?manageIntegrations=true`}
                      >
                        <Button size="sm" variant="outline">
                          {t("quickActions.activeCollection.button")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("quickActions.passiveCollection.title")}
                      </CardTitle>
                      <KanbanSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {t("quickActions.passiveCollection.subtitle")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("quickActions.passiveCollection.description")}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`${slug}/my-community/integrations`}>
                        <Button size="sm" variant="outline">
                          {t("quickActions.passiveCollection.button")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  {t("setupGuide.title")}
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("setupGuide.step1.title")}
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {t("setupGuide.step1.subtitle")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("setupGuide.step1.description")}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        {t("setupGuide.step1.button")}
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        {t("setupGuide.step2.title")}
                      </CardTitle>
                      <BotMessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {t("setupGuide.step2.subtitle")}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("setupGuide.step2.description")}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`${slug}/my-community/integrations?connect=true`}
                      >
                        <Button size="sm" variant="outline">
                          {t("setupGuide.step2.button")}
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            )}

            {/* Section d'exploration des fonctionnalités */}
            <Card>
              <CardHeader>
                <CardTitle>{t("features.title")}</CardTitle>
                <CardDescription>{t("features.description")}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="passive" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                    <TabsTrigger value="passive">
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      {t("features.passive.tab")}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      <Vote className="mr-2 h-4 w-4" />
                      {t("features.active.tab")}
                    </TabsTrigger>
                    <TabsTrigger value="management">
                      <Users2 className="mr-2 h-4 w-4" />
                      {t("features.management.tab")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="passive" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      {t("features.passive.title")}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {t("features.passive.description")}
                    </p>
                  </TabsContent>
                  <TabsContent value="active" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      {t("features.active.title")}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {t("features.active.description")}
                    </p>
                  </TabsContent>
                  <TabsContent value="management" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      {t("features.management.title")}
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      {t("features.management.description")}
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>{t("tips.permissions.title")}</AlertTitle>
                <AlertDescription>
                  {t("tips.permissions.description")}
                </AlertDescription>
              </Alert>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>{t("tips.relevance.title")}</AlertTitle>
                <AlertDescription>
                  {t("tips.relevance.description")}
                </AlertDescription>
              </Alert>
            </div>

            {/* Section FAQ */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                {t("faq.title")}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>{t("faq.q1_trigger")}</AccordionTrigger>
                  <AccordionContent>{t("faq.q1_content")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>{t("faq.q2_trigger")}</AccordionTrigger>
                  <AccordionContent>{t("faq.q2_content")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>{t("faq.q3_trigger")}</AccordionTrigger>
                  <AccordionContent>{t("faq.q3_content")}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>{t("faq.q4_trigger")}</AccordionTrigger>
                  <AccordionContent>{t("faq.q4_content")}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Separator />

            {/* Vision Future */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  {t("future.title")}
                </CardTitle>
                <CardDescription>{t("future.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {t("future.contentCreation.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("future.contentCreation.description")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      {t("future.rewards.title")}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {t("future.rewards.description")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </div>
  );
}
