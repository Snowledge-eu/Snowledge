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

export function Dashboard1() {
  const { activeCommunity } = useCurrentCommunity();
  const { slug } = useParams();

  const isDiscordConnected = !!activeCommunity?.discordServerId;

  return (
    <div className="min-h-screen">
      <SidebarInset className="flex-1 overflow-hidden">
        <div className="bg-background h-full overflow-auto">
          <div className="p-4 md:p-8 flex flex-col gap-8">
            {/* Section d'accueil */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Votre Centre de Contrôle Communautaire
              </h1>
              <p className="text-lg text-muted-foreground">
                Transformez les conversations de votre Discord en décisions et
                en contenu pertinent. Écoutez, analysez, agissez.
              </p>
            </div>

            <Separator />

            {/* Guide de démarrage rapide OU Actions rapides */}
            {isDiscordConnected ? (
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  Vos actions rapides
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sonder votre communauté
                      </CardTitle>
                      <PlusCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        Créer une proposition
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lancez un vote sur une nouvelle idée ou une question
                        importante.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`${slug}/global/voting/create-topic`}>
                        <Button size="sm">Nouvelle proposition</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Collecte Active
                      </CardTitle>
                      <Vote className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        Gérer les salons de vote
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Modifiez les salons utilisés pour les propositions et
                        les résultats.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`${slug}/my-community/integrations?manageIntegrations=true`}
                      >
                        <Button size="sm" variant="outline">
                          Gérer les salons
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Collecte Passive
                      </CardTitle>
                      <KanbanSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        Gérer les salons d'analyse
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ajoutez ou retirez des salons pour l'analyse des
                        tendances par l'IA.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`${slug}/my-community/integrations`}>
                        <Button size="sm" variant="outline">
                          Gérer les salons
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">
                  Finalisez la configuration de votre communauté
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Étape 1
                      </CardTitle>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        Votre Communauté est Prête
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Votre espace centralisé sur Snowledge est créé et prêt à
                        être connecté.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button size="sm" disabled>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Terminé
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Étape 2
                      </CardTitle>
                      <BotMessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        Connectez votre Discord
                      </div>
                      <p className="text-xs text-muted-foreground">
                        C'est l'étape essentielle pour activer la collecte de
                        données et les votes.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`${slug}/my-community/integrations?connect=true`}
                      >
                        <Button size="sm" variant="outline">
                          Lier un serveur
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
                <CardTitle>Au cœur de votre réacteur communautaire</CardTitle>
                <CardDescription>
                  Découvrez comment nos outils transforment l'information en
                  action.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="passive" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
                    <TabsTrigger value="passive">
                      <BrainCircuit className="mr-2 h-4 w-4" />
                      Collecte Passive : Tendances & Analyse
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      <Vote className="mr-2 h-4 w-4" />
                      Collecte Active : Propositions & Votes
                    </TabsTrigger>
                    <TabsTrigger value="management">
                      <Users2 className="mr-2 h-4 w-4" />
                      Gestion de la communauté
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="passive" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      L'IA au service de votre intuition
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Une fois que vous avez autorisé notre bot à lire certains
                      canaux, notre système se met au travail. Toutes les
                      conversations sont agrégées et peuvent être envoyées à
                      notre LLM. En un clic depuis votre onglet "Tendance et
                      Analytics", demandez une analyse de sentiment pour savoir
                      si l'ambiance est positive, un résumé des points clés des
                      dernières 24h, ou une identification des sujets
                      récurrents. Ne naviguez plus à vue, comprenez ce qui fait
                      vibrer votre communauté.
                    </p>
                  </TabsContent>
                  <TabsContent value="active" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      Donnez une voix à votre communauté
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      La collecte active est votre outil de gouvernance. En
                      activant cette fonction, le bot déploie trois salons
                      dédiés sur votre Discord : un pour que les membres
                      soumettent des idées (#propositions), un pour voter
                      (#votes), et un pour afficher les décisions finales
                      (#résultats). Toutes ces activités sont synchronisées sur
                      votre plateforme Snowledge dans l'onglet "Voting", vous
                      donnant une vue d'ensemble et un contrôle total sur les
                      décisions qui façonnent votre communauté.
                    </p>
                  </TabsContent>
                  <TabsContent value="management" className="pt-6">
                    <h3 className="text-xl font-semibold">
                      Une intégration simple et sécurisée
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Lorsque notre bot rejoint votre serveur, il crée un salon
                      d'accueil. Les membres de votre Discord peuvent y cliquer
                      sur un bouton pour autoriser Snowledge, ce qui leur crée
                      un compte en un clin d'œil et leur attribue le rôle
                      "Snowledge Authenticated". Ce rôle est la clé : il leur
                      donne accès à tous les canaux spéciaux que vous créez via
                      le bot, comme les salons de vote. Vous gardez ainsi le
                      contrôle sur qui participe aux processus de décision.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertTitle>Astuce de pro : Permissions du Bot</AlertTitle>
                <AlertDescription>
                  Pour que la collecte passive fonctionne sur des salons privés,
                  assurez-vous que le bot Snowledge a bien le rôle et les
                  permissions nécessaires pour lire les messages dans ces
                  canaux.
                </AlertDescription>
              </Alert>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Pour des analyses pertinentes</AlertTitle>
                <AlertDescription>
                  La qualité des analyses de l'IA dépend des conversations.
                  Choisissez des salons actifs où les discussions sont les plus
                  riches pour obtenir les meilleurs résumés et tendances.
                </AlertDescription>
              </Alert>
            </div>

            {/* Section FAQ */}
            <div>
              <h2 className="text-2xl font-bold tracking-tight mb-4">
                Questions Fréquentes (FAQ)
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    Comment mes utilisateurs s'inscrivent-ils à Snowledge ?
                  </AccordionTrigger>
                  <AccordionContent>
                    C'est très simple. Le bot crée un salon sur votre Discord
                    avec un bouton d'autorisation. En cliquant dessus,
                    l'utilisateur accepte nos conditions et un compte Snowledge
                    est créé pour lui, lié à son identifiant Discord.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    À quoi sert le rôle "Snowledge Authenticated" ?
                  </AccordionTrigger>
                  <AccordionContent>
                    Ce rôle est attribué automatiquement aux utilisateurs qui
                    ont lié leur compte. Il vous permet de leur donner accès à
                    des canaux exclusifs, comme ceux pour les propositions et
                    les votes, assurant que seuls les membres engagés
                    participent.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    Est-ce que le bot lit tous mes messages ?
                  </AccordionTrigger>
                  <AccordionContent>
                    Non. Le bot ne lira que les messages des canaux que vous
                    aurez explicitement sélectionnés pour la collecte passive
                    dans votre interface. Vous avez le contrôle total sur les
                    données que vous souhaitez analyser.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    Puis-je utiliser Snowledge sans Discord ?
                  </AccordionTrigger>
                  <AccordionContent>
                    Pour le moment, Discord est notre première et principale
                    intégration, car c'est là que vivent de nombreuses
                    communautés. Nous prévoyons d'intégrer d'autres plateformes
                    comme Telegram, YouTube et WhatsApp à l'avenir.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Separator />

            {/* Vision Future */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Notre vision pour l'avenir
                </CardTitle>
                <CardDescription>
                  Snowledge ne fait que commencer. Voici la suite de l'aventure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Aide à la création de contenu
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Nous allons intégrer des outils d'IA pour vous aider à
                      transformer les tendances de votre communauté en ébauches
                      d'articles, de scripts vidéo ou de posts, directement
                      depuis Snowledge.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Medal className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">
                      Système de récompenses pour contributeurs
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Identifiez et remerciez automatiquement les membres les
                      plus actifs et pertinents de votre communauté. Mettez en
                      valeur vos ambassadeurs et encouragez l'engagement
                      positif.
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
