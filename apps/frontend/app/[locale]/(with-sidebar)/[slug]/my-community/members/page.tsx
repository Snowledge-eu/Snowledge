"use client";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@repo/ui";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useMemberMutations } from "@/components/manage-members/hooks/useMemberMutations";
import { MemberActions } from "@/components/manage-members/MemberActions";
import { useMembersQuery } from "@/components/manage-members/hooks/useMembersQuery";
import { Member } from "@/types/member";
import { features } from "@/config/features";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";

export default function Page() {
  const { fetcher } = useAuth();
  const { slug } = useParams();
  const queryClient = useQueryClient();
  if (!features.community.myCommunity.members) {
    notFound();
  }
  const [search, setSearch] = useState("");
  const t = useTranslations("members");
  const expertiseOptions = [
    { label: "Tech", value: "technology" },
    { label: "Business", value: "business" },
    { label: "Finance", value: "finance" },
  ];
  // Fetch des membres
  const {
    data: members = [],
    isLoading,
    isError,
  } = useMembersQuery(slug as string);

  const { deleteMutation, promoteMutation } = useMemberMutations(
    slug as string
  );
  const handleExpertiseChange = async (idContrib: number, value: string) => {
    const body = { expertise: value };
    try{
      await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/add-expertise/${idContrib}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      ).catch((err) => console.error(err));
      // Mise à jour du cache React Query
      queryClient.setQueryData(["learners", slug], (oldMembers: Member[] | undefined) => {
        if (!oldMembers) return oldMembers;

        return oldMembers.map((member) =>
          member.user.id === idContrib
            ? {
                ...member,
                user: {
                  ...member.user,
                  expertise: value,
                },
              }
            : member
        );
      });
    } catch (error) {
      console.error(error);
    }

  }
  // Filtrage
  const filteredMembers =
    members.length > 0
      ? members.filter((m: Member) => {
          const name = `${m.user.firstname} ${m.user.lastname}`.toLowerCase();
          return (
            name.includes(search.toLowerCase()) ||
            m.user.email.toLowerCase().includes(search.toLowerCase())
          );
        })
      : [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <div className="mb-4 flex items-center gap-4">
        <Input
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("role_member")}</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{t("role_contributor")}</TableHead>
            <TableHead>{t("added_on")}</TableHead>
            <TableHead>{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredMembers.map((member: Member) => (
            <TableRow key={member.id}>
              <TableCell>
                {member.user.firstname} {member.user.lastname}
              </TableCell>
              <TableCell>{member.user.email}</TableCell>
              <TableCell> 
                <Select value={member.user.expertise} onValueChange={(value: string) => handleExpertiseChange(member.user.id, value)}>
                  <SelectTrigger
                    id={`${member.id}-expertise`}
                    className="w-64"
                  >
                    <SelectValue placeholder="Select expertise" />
                  </SelectTrigger>
                  <SelectContent>
                    {expertiseOptions.map((opt) => (
                      <SelectItem key={opt.label} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <span className="capitalize">
                  {member.isContributor
                    ? t("role_contributor")
                    : t("role_member")}
                </span>
              </TableCell>
              <TableCell>
                {new Date(member.created_at).toLocaleDateString("fr-FR")}
              </TableCell>
              <TableCell>
                <MemberActions
                  member={member}
                  promoteMutation={promoteMutation}
                  deleteMutation={deleteMutation}
                  t={t}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {filteredMembers.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground mt-8">
          {t("no_member")}
        </div>
      )}
      {isLoading && <div>{t("loading")}</div>}
      {isError && <div className="text-red-500 mt-4">{t("error")}</div>}
    </div>
  );
}
