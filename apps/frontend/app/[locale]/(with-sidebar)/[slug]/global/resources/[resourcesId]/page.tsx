"use client";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import { Upload, Copy } from "lucide-react";
import { useResource } from "@/hooks/useResources";
import { useState, useRef } from "react";

export default function ResourcePage() {
  const { activeCommunity } = useCurrentCommunity();
  const { user } = useAuth();
  const { resourcesId, slug } = useParams();
  const {
    data: resource,
    isLoading,
    error,
  } = useResource(resourcesId as string);
  // Simule l'accès (à remplacer par la vraie logique plus tard)
  const [hasAccess, setHasAccess] = useState(false);
  // Pour l'édition
  const [editTitle, setEditTitle] = useState("");
  const [editFile, setEditFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ajout pour copier le lien
  const [copied, setCopied] = useState(false);
  const resourceUrl =
    typeof window !== "undefined"
      ? window.location.origin + `/${slug}/global/resources/${resourcesId}/buy`
      : "";
  const handleCopy = () => {
    navigator.clipboard.writeText(resourceUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error || !resource)
    return <div>Erreur : {error?.message || "Ressource introuvable"}</div>;

  // Créateur : édition
  if (user?.id === activeCommunity?.user?.id) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-2 md:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Colonne gauche : résumé visuel, stats, contributeurs, aperçu PDF */}
          <div className="space-y-6">
            {/* Résumé visuel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {resource.title}
                  <Badge variant="secondary" className="ml-2">
                    {resource.format}
                  </Badge>
                </CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <Separator />
                <div className="flex flex-col gap-1 text-sm">
                  <span>
                    <b>Durée :</b> {resource.duration}
                  </span>
                  <span>
                    <b>Date :</b> {resource.date}
                  </span>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-1">Plan</h3>
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
              </CardContent>
            </Card>
            {/* Stats mockées */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-lg">12</span>
                  <div className="text-muted-foreground">Acheteurs</div>
                </div>
                <div>
                  <span className="font-bold text-lg">87</span>
                  <div className="text-muted-foreground">Vues</div>
                </div>
                <div>
                  <span className="font-bold text-lg">2024-06-01</span>
                  <div className="text-muted-foreground">Créée le</div>
                </div>
              </CardContent>
            </Card>
            {/* Contributeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Contributeurs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {resource.contributors.map((contrib) => (
                  <div
                    key={contrib.id}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/20"
                  >
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-primary">
                      {contrib.initials}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{contrib.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {contrib.description}
                      </div>
                    </div>
                    <Badge variant="outline">{contrib.sharePct}%</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* Aperçu PDF si whitepaper */}
            {resource.format === "Whitepaper" && resource.pdfUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Aperçu du PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={resource.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 underline"
                  >
                    <Upload className="w-4 h-4" /> Voir le PDF actuel
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Colonne droite : édition + partage lien */}
          <div className="space-y-6">
            {/* Bloc de partage du lien */}
            <Card className="border border-primary/40 bg-primary/5">
              <CardHeader>
                <CardTitle>Partager le lien</CardTitle>
                <CardDescription>
                  Copie ce lien pour le partager à tes acheteurs potentiels.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center">
                  <Input
                    value={resourceUrl}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopy}
                    title="Copier le lien"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {copied && (
                    <span className="text-green-600 text-xs ml-2">Copié !</span>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Bloc édition */}
            <Card>
              <CardHeader>
                <CardTitle>Éditer la ressource</CardTitle>
                <CardDescription>
                  Modifie le titre et le fichier associé si besoin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Titre
                  </label>
                  <Input
                    value={editTitle || resource.title}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Titre de la ressource"
                    className="max-w-md"
                  />
                </div>
                {resource.format === "Whitepaper" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Fichier PDF
                    </label>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {editFile ? editFile.name : "Déposer un PDF"}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) =>
                          setEditFile(e.target.files?.[0] || null)
                        }
                      />
                      {resource.pdfUrl && !editFile && (
                        <a
                          href={resource.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm"
                        >
                          Voir le PDF actuel
                        </a>
                      )}
                    </div>
                  </div>
                )}
                <Button className="mt-4">Enregistrer</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Acheteur : accès accordé
  if (hasAccess) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <Card className="bg-green-50 border-green-200">
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
            <div className="bg-green-100 rounded-md p-4 text-green-900 text-center text-lg font-medium">
              🎉 Félicitations ! Vous faites désormais partie des membres ayant
              débloqué ce contenu premium.
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
                Durée : {resource.duration}
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
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Non-acheteur : accès refusé
  return (
    <div className="max-w-2xl mx-auto py-10 space-y-8">
      <Card className="bg-yellow-50 border-yellow-200">
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
            Accédez à <span className="font-semibold">{resource.title}</span> et
            rejoignez la communauté des membres premium.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-100 rounded-md p-4 text-yellow-900 text-center text-lg font-medium">
            🚀 Ce contenu est réservé aux membres ayant débloqué l'accès.
            Découvrez&nbsp;:
          </div>
          <ul className="list-disc pl-8 text-base text-yellow-900 space-y-1">
            <li>Accès complet au plan détaillé et à toutes les sections</li>
            {resource.format === "Whitepaper" && (
              <li>Téléchargement du PDF exclusif</li>
            )}
            <li>
              Participation à la communauté et échanges avec les contributeurs
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
              <Link href={`/${slug}/global/resources/${resourcesId}/buy`}>
                Acheter maintenant
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
