"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";

export default function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isMobile } = useSidebar();
  const { user: authUser } = useAuth();
  const { secureQuery } = useSecureApi();
  const { secureMutation } = useSecureApi();
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!authUser?.id) return;
      setLoading(true);
      setError(false);
      try {
        const res = await secureQuery(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/xrpl/balance/${authUser.id}`,
        );
        if (res.ok) {
          const data = await res?.data;
          if (typeof data === "number" || typeof data === "string") {
            const num = Number(data);
            setBalance(!isNaN(num) ? num.toFixed(3) : "0.000");
          } else if (data && typeof data.balance !== "undefined") {
            const num = Number(data.balance);
            setBalance(!isNaN(num) ? num.toFixed(3) : "0.000");
          } else {
            setBalance("0.000");
          }
        } else {
          setError(true);
          setBalance(null);
        }
      } catch {
        setError(true);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [authUser?.id]);

  const signOut = async () => {
    try {
      const response = await secureMutation(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/session`,
        {
          method: "DELETE",
        }
      );
      if (response.status === 204) {
        localStorage.removeItem("activeCommunityId");
        window.location.href = "/";
      } else {
        console.error("Failed to sign out");
      }
    } catch (err: any) {
      console.error(err.message || "An unexpected error occurred.");
    }
  };
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
                <span className="truncate text-xs flex items-center gap-1 mt-0.5">
                  {loading ? (
                    <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
                  ) : error ? (
                    <span
                      className="flex items-center text-red-500 gap-1"
                      title="Error fetching XRPL balance"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Error</span>
                    </span>
                  ) : (
                    <span
                      className={`flex items-center gap-1 py-0.5 rounded text-xs font-semibold transition-colors duration-200`}
                      title="XRPL Wallet Balance"
                    >
                      <Image
                        src="/strk-logo.png"
                        alt="XRP"
                        width={12}
                        height={12}
                        className="inline-block align-middle mr-0.5"
                      />
                      {balance} <span className="ml-0.5">STRK</span>
                    </span>
                  )}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  <span className="truncate text-xs flex items-center gap-1 mt-0.5">
                    {loading ? (
                      <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
                    ) : error ? (
                      <span
                        className="flex items-center text-red-500 gap-1"
                        title="Error fetching XRPL balance"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>Error</span>
                      </span>
                    ) : (
                      <span
                        className={`flex items-center gap-1 py-0.5 rounded text-xs font-semibold transition-colors duration-200 "}`}
                        title="XRPL Wallet Balance"
                      >
                        <Image
                          src="/strk-logo.png"
                          alt="XRP"
                          width={16}
                          height={16}
                          className="inline-block align-middle mr-0.5"
                        />
                        {balance} <span className="ml-0.5">STRK</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            <DropdownMenuGroup>
              <Link href="/profile">
                <DropdownMenuItem>
                  <BadgeCheck />
                  Account
                </DropdownMenuItem>
              </Link>
              {/* <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem> */}
              <Link href="/notifications">
                <DropdownMenuItem>
                  <Bell />
                  Notifications
                </DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
