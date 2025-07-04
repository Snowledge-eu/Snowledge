"use client";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { useResource } from "@/hooks/useResources";
import { ResourceAccessStatus } from "./ResourceAccessStatus";

export default function ResourcePage() {
  const { resourcesId } = useParams();
  const {
    data: resource,
    isLoading,
    error,
  } = useResource(resourcesId as string);

  if (isLoading) return <div>Chargement...</div>;
  if (error || !resource)
    return <div>Erreur : {error?.message || "Ressource introuvable"}</div>;

  return (
    <ResourceAccessStatus resourcesId={resourcesId as string}>
      {({ hasNft, loading, error }) => {
        if (loading) return null; // le loader est déjà géré dans ResourceAccessStatus
        if (error) return <div>Erreur d'accès : {error}</div>;
        if (hasNft) {
          return (
            <div className="max-w-3xl mx-auto py-10 space-y-8">
              {/*<Card className="bg-green-50 border-green-200"> */}
              <Card className="border-green-200">
                <CardHeader className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-12 h-12 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="white"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2 2l4-4"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl font-bold text-green-700">
                    Merci pour votre achat !
                  </CardTitle>
                  <CardDescription className="text-green-800 mt-2">
                    Vous avez maintenant accès à la ressource{" "}
                    <span className="font-semibold">{resource.title}</span>.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/*<div className="rounded-md p-4 text-green-900 text-center text-lg font-medium bg-green-100">*/}
                  <div className="rounded-md p-4 text-green-900 text-center text-lg font-medium">
                    🎉 Félicitations ! Vous faites désormais partie des membres
                    ayant débloqué ce contenu premium.
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-2">
                    {resource.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex flex-col gap-2 items-center">
                    <span className="text-base font-medium">
                      Format : {resource.format}
                    </span>
                    <span className="text-base font-medium">
                      Taille : {resource.length} pages
                    </span>
                    {resource.format === "Whitepaper" && resource.pdfUrl && (
                      <a
                        href={resource.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="lg" className="mt-4">
                          Télécharger le PDF
                        </Button>
                      </a>
                    )}
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 text-center">
                      Plan de la ressource
                    </h3>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                      {resource.outlines.map((item, idx) => (
                        <li key={idx}>
                          <span className="font-medium text-foreground">
                            {item.title}
                          </span>{" "}
                          : {item.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-center mt-6">
                    <span className="text-green-700 font-semibold">
                      Merci pour votre confiance et bonne découverte !
                    </span>
                    <div className="mt-4 flex justify-center">
                      <Button asChild size="lg" variant="outline">
                        <a href="/">Retour à l'accueil</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        // Non-acheteur : accès refusé
        return (
          <div className="max-w-2xl mx-auto py-10 space-y-8">
            {/*<Card className="bg-yellow-50 border-yellow-200"> */}
            <Card className="border-yellow-200">
              <CardHeader className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg
                    className="w-12 h-12 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="white"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 2"
                    />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold text-yellow-700">
                  Débloquez ce contenu exclusif !
                </CardTitle>
                <CardDescription className="text-yellow-800 mt-2">
                  Accédez à{" "}
                  <span className="font-semibold">{resource.title}</span> et
                  rejoignez la communauté des membres premium.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/*<div className="bg-yellow-100 rounded-md p-4 text-yellow-900 text-center text-lg font-medium">*/}
                <div className="rounded-md p-4 text-yellow-900 text-center text-lg font-medium">
                  🚀 Ce contenu est réservé aux membres ayant débloqué l'accès.
                  Découvrez&nbsp;:
                </div>
                <ul className="list-disc pl-8 text-base text-yellow-900 space-y-1">
                  <li>
                    Accès complet au plan détaillé et à toutes les sections
                  </li>
                  {resource.format === "Whitepaper" && (
                    <li>Téléchargement du PDF exclusif</li>
                  )}
                  <li>
                    Participation à la communauté et échanges avec les
                    contributeurs
                  </li>
                  <li>Support prioritaire et mises à jour du contenu</li>
                </ul>
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <Separator />
                <div className="text-center py-4">
                  <span className="block text-lg font-semibold mb-2 text-yellow-800">
                    Vous n'avez pas encore accès à cette ressource
                  </span>
                  <span className="block text-muted-foreground mb-4">
                    Pour débloquer le contenu premium, cliquez sur le bouton
                    ci-dessous.
                  </span>
                  <Button asChild size="lg" className="mt-2">
                    <Link href={`/resources/${resourcesId}/buy`}>
                      Acheter maintenant
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      }}
    </ResourceAccessStatus>
  );
}
