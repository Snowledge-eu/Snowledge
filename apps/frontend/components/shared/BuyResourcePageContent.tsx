"use client";
import React, { useState, useEffect } from "react";
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
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Separator } from "@repo/ui/components/separator";
import { useResource, useHasResourceNft } from "@/hooks/useResources";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@repo/ui/components/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ResourceAccessStatus } from "./ResourceAccessStatus";

// Fonction utilitaire pour tronquer les hash/adresses
function truncateMiddle(str: string, front = 5, back = 5) {
  if (!str) return "";
  if (str.length <= front + back + 3) return str;
  return `${str.slice(0, front)}...${str.slice(-back)}`;
}

export default function BuyResourcePageContent() {
  const { resourcesId } = useParams();
  const {
    data: resource,
    isLoading,
    error,
  } = useResource(resourcesId as string);

  const { data: nftStatus, refetch: refetchNftStatus } = useHasResourceNft(
    resourcesId as string
  );

  const [open, setOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<
    "idle" | "pending" | "success" | "error"
  >("idle");
  const [txResult, setTxResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const {
    data: balances,
    isLoading: loadingBalances,
    refetch: refetchBalances,
  } = useQuery({
    queryKey: ["resource-balances", resourcesId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/resources/${resourcesId}/balances`,
        {
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: open,
  });

  // React Query mutation pour l'achat
  const buyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/resources/${resourcesId}/buy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onMutate: () => {
      setTxStatus("pending");
      setErrorMsg(null);
      setTxResult(null);
    },
    onSuccess: (data) => {
      setTxResult(data);
      console.log("[BuyResourcePage] Résultat achat", data);
      setTxStatus("success");
    },
    onError: (error: any) => {
      setErrorMsg(error.message || "Erreur lors de la transaction");
      setTxStatus("error");
    },
  });

  // Après un achat réussi, refetch les balances ET le statut NFT
  useEffect(() => {
    if (txStatus === "success") {
      refetchBalances();
      refetchNftStatus();
    }
  }, [txStatus, refetchBalances, refetchNftStatus]);

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
    creator,
  } = resource;

  // Conversion 10€ = 1 XRP
  const priceXRP = (price / 10).toFixed(2);

  // Distribution calculée (créateur + contributeurs) en XRP
  const distribution = [
    {
      label: "Creator",
      pct: creatorSharePct,
      amount: ((parseFloat(priceXRP) * creatorSharePct) / 100).toFixed(2),
      ...creator,
    },
    ...contributors.map((c: any) => ({
      label: "Contributor",
      pct: c.sharePct,
      amount: ((parseFloat(priceXRP) * c.sharePct) / 100).toFixed(2),
      ...c,
    })),
  ];

  return (
    <ResourceAccessStatus resourcesId={resourcesId as string}>
      {({ hasNft, loading, error, refetch }) => (
        <>
          <div className="px-6 pt-8 pb-10 space-y-10">
            <div className="space-y-2">
              <h1 className="text-2xl fon t-bold">{title}</h1>
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
                      {tags.map((tag: string) => (
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
                          <span className="text-sm font-medium">
                            {duration}
                          </span>
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
                      {outlines.map((item: any, idx: number) => (
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
                      Join other learners who are already enrolled and connect
                      with the community.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 flex-wrap">
                      {attendees.slice(0, 8).map((attendee: any) => (
                        <TooltipProvider key={attendee.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary">
                                <AvatarFallback>
                                  {attendee.initials}
                                </AvatarFallback>
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
                    {contributors.map((contributor: any) => (
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
                              {contributor.expertises.map((exp: string) => (
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
                                $
                                {((price * contributor.sharePct) / 100).toFixed(
                                  2
                                )}
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
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={hasNft}>
                        {hasNft ? "Resource already unlocked" : "Purchase now"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="!max-w-5xl !w-fit">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-primary">
                          Confirmer l'achat
                        </DialogTitle>
                        <DialogDescription>
                          Récapitulatif de votre achat et distribution XRPL.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="mt-4">
                        <div className="mt-2 text-base">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-muted-foreground" />
                            <span>Prix :</span>
                            <span className="font-bold">{price} €</span>
                            <span className="font-bold">≈ {priceXRP} XRP</span>
                            <span className="text-xs text-muted-foreground">
                              (10€ = 1 XRP testnet)
                            </span>
                          </div>
                          <div className="mt-2">Distribution :</div>
                          <ul className="mt-1 space-y-1">
                            {distribution.map((d, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {d.label}
                                </span>
                                <span className="rounded bg-muted px-2 py-0.5 text-xs">
                                  {d.pct}%
                                </span>
                                <span className="text-green-700 font-bold">
                                  {d.amount} XRP
                                </span>
                                <span className="text-muted-foreground">
                                  ({d.title})
                                </span>
                              </li>
                            ))}
                          </ul>
                          <Separator className="my-3" />
                          <div className="flex items-center gap-2">
                            <span>Votre balance actuelle :</span>
                            {loadingBalances ? (
                              <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                              <span className="font-bold text-primary">
                                {balances?.buyer ?? "?"} XRP
                              </span>
                            )}
                          </div>
                          <div className="mt-2">
                            Balances des bénéficiaires :
                          </div>
                          <ul className="mt-1 space-y-1">
                            {distribution.map((d, i) => {
                              const userKey = Number(d.userId);
                              // DEBUG
                              console.log("[Balances DEBUG]", {
                                userKey,
                                userKeyType: typeof userKey,
                                d_userId: d.userId,
                                d_userIdType: typeof d.userId,
                                balances,
                                balancesKeys: balances
                                  ? Object.keys(balances)
                                  : null,
                                value: balances?.[userKey],
                              });
                              return (
                                <li key={i} className="flex items-center gap-2">
                                  <span className="font-semibold text-sm">
                                    {d.label}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ({d.title})
                                  </span>
                                  <span className="font-bold text-blue-700">
                                    {loadingBalances ? (
                                      <Loader2 className="inline animate-spin w-4 h-4 text-blue-700" />
                                    ) : balances?.[userKey] === undefined ? (
                                      <span className="text-red-500">
                                        Erreur
                                      </span>
                                    ) : balances[userKey] === null ? (
                                      <span className="text-muted-foreground">
                                        Non disponible
                                      </span>
                                    ) : (
                                      `${balances[userKey]} XRP`
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div className="mt-4">
                          {hasNft && (
                            <Button
                              className="text-lg px-6 py-3"
                              onClick={() => {
                                window.location.href = `/resources/${resourcesId}`;
                              }}
                            >
                              Accéder à la ressource
                            </Button>
                          )}
                          {txStatus === "idle" && (
                            <Button
                              className="w-full text-lg py-3"
                              onClick={() => buyMutation.mutate()}
                              disabled={buyMutation.isPending}
                            >
                              Confirmer l'achat
                            </Button>
                          )}
                          {txStatus === "pending" && (
                            <div className="flex flex-col items-center gap-2 py-4">
                              <Loader2 className="animate-spin w-8 h-8 text-primary" />
                              <span className="text-primary font-semibold">
                                Transaction en cours sur le testnet XRPL...
                              </span>
                            </div>
                          )}
                          {txStatus === "success" && (
                            <div className="flex flex-col md:flex-row flex-wrap gap-4 py-4 w-full">
                              {/* Bloc Transactions XRPL (paiements) */}
                              {txResult?.txResults?.length > 0 && (
                                <div className="flex-1 bg-muted/40 border rounded p-4 text-xs min-w-0 max-w-full w-full overflow-x-auto">
                                  <div className="mb-2 font-semibold text-muted-foreground">
                                    Transactions XRPL (distribution)
                                  </div>
                                  {txResult.txResults.map(
                                    (tx: any, i: number) => (
                                      <div
                                        key={i}
                                        className="mb-4 p-2 rounded bg-muted/20 border last:mb-0"
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs">
                                            Hash :
                                          </span>
                                          <span
                                            className="font-mono break-all text-xs"
                                            title={tx.tx?.result?.hash}
                                          >
                                            {truncateMiddle(
                                              tx.tx?.result?.hash
                                            )}
                                          </span>
                                        </div>
                                        {tx.tx?.result?.hash && (
                                          <a
                                            href={`https://testnet.xrpl.org/transactions/${tx.tx.result.hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 underline text-xs"
                                          >
                                            Voir sur XRPL Explorer
                                          </a>
                                        )}
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="font-mono text-xs">
                                            Montant :
                                          </span>
                                          <span className="font-bold text-green-700">
                                            {tx.amount} XRP
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="font-mono text-xs">
                                            Destinataire :
                                          </span>
                                          <span
                                            className="font-mono break-all text-xs"
                                            title={tx.to}
                                          >
                                            {truncateMiddle(tx.to)}
                                          </span>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                              {/* Bloc NFT d'accès (mint + transfert) */}
                              {txResult?.nftMintResult && (
                                <div className="flex-1 bg-green-50 border border-green-200 rounded p-4 text-xs min-w-0">
                                  <div className="font-semibold text-green-700 mb-1">
                                    Votre NFT d'accès à la ressource a bien été
                                    créé et transféré sur votre wallet XRPL.
                                  </div>
                                  {/* Étape 1 : Mint du NFT */}
                                  <div className="mb-2">
                                    <span className="font-semibold">
                                      Étape 1 : Mint du NFT
                                    </span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="font-mono">
                                        Hash mint :
                                      </span>
                                      <span className="font-mono break-all">
                                        {truncateMiddle(
                                          txResult.nftMintResult?.mintResult
                                            ?.result?.hash ||
                                            txResult.nftMintResult?.result?.hash
                                        )}
                                      </span>
                                    </div>
                                    {txResult.nftMintResult?.mintResult?.result
                                      ?.hash && (
                                      <a
                                        href={`https://testnet.xrpl.org/transactions/${txResult.nftMintResult.mintResult.result.hash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-xs"
                                      >
                                        Voir le mint sur XRPL Explorer
                                      </a>
                                    )}
                                  </div>
                                  {/* Étape 2 : Transfert du NFT */}
                                  {txResult.nftMintResult?.transferResult && (
                                    <div className="mb-2">
                                      <span className="font-semibold">
                                        Étape 2 : Transfert du NFT
                                      </span>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="font-mono">
                                          Hash transfert :
                                        </span>
                                        <span className="font-mono break-all">
                                          {truncateMiddle(
                                            txResult.nftMintResult
                                              .transferResult?.acceptResult
                                              ?.result?.hash ||
                                              txResult.nftMintResult
                                                .transferResult?.offerResult
                                                ?.result?.hash
                                          )}
                                        </span>
                                      </div>
                                      {txResult.nftMintResult.transferResult
                                        ?.acceptResult?.result?.hash && (
                                        <a
                                          href={`https://testnet.xrpl.org/transactions/${txResult.nftMintResult.transferResult.acceptResult.result.hash}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 underline text-xs"
                                        >
                                          Voir le transfert sur XRPL Explorer
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  {/* Lien pour visualiser le NFT sur xrplexplorer.com avec tooltip explicatif */}
                                  {txResult.nftMintResult?.nftId && (
                                    <div className="mt-2">
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <a
                                              href={`https://test.xrplexplorer.com/en/nft/${txResult.nftMintResult.nftId}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 underline text-xs cursor-pointer"
                                            >
                                              Visualiser ce NFT sur XRPL
                                              Explorer
                                            </a>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs text-xs">
                                            <div className="font-semibold mb-1">
                                              Comment fonctionne l'accès
                                              XRPL&nbsp;?
                                            </div>
                                            <div>
                                              1. Le backend <b>mint</b> un NFT
                                              d'accès unique pour cette
                                              ressource.
                                              <br />
                                              2. Il crée une{" "}
                                              <b>offre de transfert</b> XRPL à 0
                                              XRP à votre adresse.
                                              <br />
                                              3. Il <b>accepte l'offre</b>{" "}
                                              automatiquement pour vous
                                              transférer le NFT.
                                              <br />
                                              4. Ce NFT devient la{" "}
                                              <b>preuve d'accès</b> à la
                                              ressource :{" "}
                                              <b>
                                                seuls les NFT mintés par
                                                l'issuer officiel (le backend)
                                              </b>{" "}
                                              donnent accès au contenu.
                                              <br />
                                              5. Lors de l'accès, le backend
                                              vérifie que{" "}
                                              <b>
                                                l'issuer du NFT est bien le
                                                backend
                                              </b>{" "}
                                              et que{" "}
                                              <b>
                                                vous en êtes le propriétaire
                                              </b>{" "}
                                              (owner).
                                              <br />
                                              <span className="text-muted-foreground">
                                                Tout est automatisé, aucune
                                                action blockchain n'est requise
                                                de votre part. La sécurité de
                                                l'accès repose sur l'issuer du
                                                NFT.
                                              </span>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  )}
                                  <div className="mt-1 text-green-700">
                                    Ce NFT est la preuve d'accès à la ressource.
                                    Vous pouvez le retrouver à tout moment dans
                                    votre wallet.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {txStatus === "error" && (
                            <div className="flex flex-col items-center gap-2 py-4">
                              <XCircle className="w-8 h-8 text-red-600" />
                              <span className="text-red-700 font-semibold">
                                Erreur lors de la transaction
                              </span>
                              <div className="text-xs text-muted-foreground">
                                {errorMsg}
                              </div>
                              <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => setTxStatus("idle")}
                              >
                                Réessayer
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {nftStatus?.hasNft && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.location.href = `/resources/${resourcesId}`;
                      }}
                    >
                      Accéder à la ressource
                    </Button>
                  )}
                  <Button variant="outline" className="w-full">
                    Return to dashboard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </ResourceAccessStatus>
  );
}
