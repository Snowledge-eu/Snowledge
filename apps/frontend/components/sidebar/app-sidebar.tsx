"use client";

import * as React from "react";
import { Home } from "lucide-react";
import { useNavMyCommunity } from "./hooks/useNavMyCommunity";

import { SidebarNavMain } from "./sidebar-nav";

import { useCurrentCommunity } from "@/hooks/useCurrentCommunity";
import { CommunitySwitcher } from "./team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar";

// import { toSlug } from "@/utils/slug";
import { useTranslations } from "next-intl";
import NavUser from "./nav-user";
import { useNavGlobal } from "./hooks/useNavGlobal";
import { useAuth } from "@/contexts/auth-context";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, fetcher } = useAuth();
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <CommunitySwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavs />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.pseudo || "Def",
            email: user?.email || "Mail",
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
              user?.pseudo || "Def"
            )}&rounded=true&background=random`,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function SidebarNavs() {
  const { activeCommunity } = useCurrentCommunity();
  // const slug = toSlug(activeCommunity?.name || "");
  const tNavbar = useTranslations("navbar");
  // const home = {
  //   title: tNavbar("dashboard"),
  //   url: `/${slug}`,
  //   icon: Home,
  // };
  const landing = {
    title: tNavbar("landing"),
    url: "/?no-redirect=true",
    icon: Home,
  };

  // const navLearner = useNavLearner(activeCommunity ?? { name: "" });
  // const navContributeur = useNavContributor(activeCommunity ?? { name: "" });
  const navMyCommunity = useNavMyCommunity(activeCommunity ?? { name: "" });
  const navGlobal = useNavGlobal(activeCommunity ?? { name: "" });

  return (
    <>
      {/* <SidebarNavMain items={[home]} label="" />
      <SidebarNavMain items={navLearner} label={tNavbar("learner")} />
      <SidebarNavMain items={navContributeur} label={tNavbar("contributor")} /> */}
      <SidebarNavMain items={navGlobal} label={tNavbar("global")} />
      <SidebarNavMain items={navMyCommunity} label={tNavbar("my-community")} />
      <SidebarNavMain items={[landing]} label="" />
      {/* <NavProjects projects={data.projects} /> */}
    </>
  );
}
