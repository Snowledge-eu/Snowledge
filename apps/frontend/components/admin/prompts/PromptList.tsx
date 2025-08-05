import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Edit, Trash2 } from "lucide-react";
import { Prompt } from "../shared/types";

interface PromptListProps {
  prompts: Prompt[];
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
}

export const PromptList = ({
  prompts,
  onEdit,
  onDelete,
  onCreate,
}: PromptListProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prompt Management</CardTitle>
          <Button onClick={onCreate}>Create Prompt</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{prompt.name}</h3>
                    <Badge variant={prompt.is_public ? "default" : "secondary"}>
                      {prompt.is_public ? "Public" : "Private"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {prompt.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Platform: {prompt.platform}</span>
                    <span>Temperature: {prompt.temperature}</span>
                    <span>Top P: {prompt.top_p}</span>
                    <span>Model: {prompt.model_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
