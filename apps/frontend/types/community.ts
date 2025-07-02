import { User } from "./user";

export type Community = {
  id: number;
  name: string;
  slug: string;
  tags: string[];
  description: string;
  communityType: "free" | "paid";
  price: number;
  yourPercentage: number;
  communityPercentage: number;
  codeOfConduct: string;
  discordServerId: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};
