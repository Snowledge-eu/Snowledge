import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { useSecureApi } from "@/hooks/useSecureApi";

interface ResourceAccessStatusProps {
  resourcesId: string;
  children: (args: {
    hasNft: boolean;
    loading: boolean;
    error: string | null;
    refetch: () => void;
    nftStatus: any;
  }) => React.ReactNode;
}

export function ResourceAccessStatus({
  resourcesId,
  children,
}: ResourceAccessStatusProps) {
  //TODO: gérer le cas où c'est un contributeur ayant créé la ressource (peut etre mint un nft pour lui, et pas avoir un bouton acheter, mais mint un nft pour lui, ou alors peut etre mint un nft pour tous les contrib au moment de la mis en vente)
  const { secureQuery } = useSecureApi();
  
  const {
    data: nftStatus,
    isLoading: loadingNft,
    error: errorNft,
    refetch: refetchNft,
  } = useQuery({
    queryKey: ["has-nft", resourcesId],
    queryFn: async () => {
      const res = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api"}/resources/${resourcesId}/has-nft`
      );
      if (!res.ok) {
        const errorMessage = res.data?.message || "Erreur lors de la vérification";
        throw new Error(errorMessage);
      }
      return res.data;
    },
    enabled: !!resourcesId,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === "Authentication failed") {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (loadingNft)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-muted/10">
        <Loader2 className="animate-spin w-12 h-12 text-primary mb-4" />
        <span className="text-lg text-muted-foreground font-semibold">
          Vérification de l'accès à la ressource...
        </span>
      </div>
    );
  if (errorNft) return <div>Erreur d'accès : {errorNft.message as string}</div>;

  return (
    <>
      {children({
        hasNft: !!nftStatus?.hasNft,
        loading: false,
        error: null,
        refetch: refetchNft,
        nftStatus,
      })}
    </>
  );
}
