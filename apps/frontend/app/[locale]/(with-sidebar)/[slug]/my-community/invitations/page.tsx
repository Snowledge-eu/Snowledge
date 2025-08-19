"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import {
  Input,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@repo/ui";
import { Copy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import ModalInvite from "@/components/create-community/modals/ModalInvite";
import { Learner } from "@/types/learner";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { useSecureApi } from "@/hooks/useSecureApi";

export default function Page() {
  const { slug } = useParams();
  if (!features.community.myCommunity.invitations) {
    notFound();
  }
  const [modalOpen, setModalOpen] = useState(false);
  const communityUrl = `${window.location.origin}/join/${slug}`;
  const { secureQuery } = useSecureApi();
  
  // Récupère les invitations en attente
  const {
    data: invited = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["invited", slug],
    queryFn: async () => {
      const res = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/communities/${slug}/learners/invited`,
      );
      if (!res.ok) throw new Error("Erreur lors du chargement des invitations");
      return res?.data;
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(communityUrl);
      toast.success("Lien copié !");
    } catch {
      toast.error("Erreur lors de la copie du lien.");
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Inviter des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input value={communityUrl} readOnly className="flex-1" />
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <Button className="w-full mb-4" onClick={() => setModalOpen(true)}>
            Inviter des utilisateurs
          </Button>
          <ModalInvite
            open={modalOpen}
            onOpenChange={setModalOpen}
            communityUrl={communityUrl}
            communitySlug={slug as string}
            refetch={refetch}
          />
          <h2 className="text-lg font-semibold mt-6 mb-2">
            Invitations en attente
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prénom</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Pseudo</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>Chargement...</TableCell>
                </TableRow>
              ) : invited.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    Aucune invitation en attente.
                  </TableCell>
                </TableRow>
              ) : (
                invited.map((learner: Learner) => (
                  <TableRow key={learner.id}>
                    <TableCell>{learner.user.firstname}</TableCell>
                    <TableCell>{learner.user.lastname}</TableCell>
                    <TableCell>{learner.user.pseudo}</TableCell>
                    <TableCell>{learner.user.email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          {/* Voir si on fait un bouton pour relancer ou annuler une invitation */}
        </CardFooter>
      </Card>
    </div>
  );
}
