import {
  SquareTerminal,
  PlusCircle,
  Loader2,
  Check,
  FileText,
} from "lucide-react";
import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import { LucideIcon } from "lucide-react";
import { features } from "@/config/features";
import { useResources } from "@/hooks/useResources";

export function useNavGlobal(activeCommunity: { name: string }) {
  const slug = toSlug(activeCommunity.name);
  const tNavbar = useTranslations("navbar");
  const { data: resources } = useResources();
  return [
    // features.community.myCommunity.generalInformations &&
    {
      title: tNavbar("voting"),
      icon: SquareTerminal,
      items: [
        {
          title: tNavbar("create-topic"),
          url: `/${slug}/global/voting/create-topic`,
          icon: PlusCircle,
        },
        {
          title: tNavbar("in-progress"),
          url: `/${slug}/global/voting/in-progress`,
          icon: Loader2,
        },
        {
          title: tNavbar("done"),
          url: `/${slug}/global/voting/done`,
          icon: Check,
        },
      ],
    },
    features.community.myCommunity.resources && {
      title: tNavbar("resources"),
      url: `/${slug}/global/resources`,
      icon: FileText,
      items:
        resources?.map((resource) => ({
          title: resource.title,
          url: `/${slug}/global/resources/${resource.id}`,
        })) || [],
    },
  ].filter(Boolean) as {
    title: string;
    url?: string;
    icon: LucideIcon;
    items?: { title: string; url: string }[];
  }[];
}
