import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Community } from "../shared/types";

interface CommunityListProps {
  communities: Community[];
  onSelect: (community: Community) => void;
}

export const CommunityList = ({
  communities,
  onSelect,
}: CommunityListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {communities.map((community) => (
            <Card key={community.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold">{community.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {community.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created by: {community.user.pseudo}</span>
                    {community.discordServer && (
                      <span>Discord: {community.discordServer.guildName}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSelect(community)}
                >
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
