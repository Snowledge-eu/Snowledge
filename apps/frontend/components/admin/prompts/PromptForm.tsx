import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import { Prompt, PromptForm as PromptFormType } from "../shared/types";
import { AVAILABLE_MODELS } from "../shared/constants";

interface PromptFormProps {
  isCreating: boolean;
  isEditing: boolean;
  selectedPrompt: Prompt | null;
  onSubmit: (formData: PromptFormType) => void;
  onCancel: () => void;
}

export const PromptForm = ({
  isCreating,
  isEditing,
  selectedPrompt,
  onSubmit,
  onCancel,
}: PromptFormProps) => {
  const [promptForm, setPromptForm] = useState<PromptFormType>({
    name: selectedPrompt?.name || "",
    description: selectedPrompt?.description || "",
    platform: selectedPrompt?.platform || "discord",
    temperature: selectedPrompt?.temperature || 0.3,
    top_p: selectedPrompt?.top_p || 0.8,
    messages: selectedPrompt?.messages || [
      { role: "system", content: "" },
      { role: "user", content: "{{messages}}" },
    ],
    response_format: selectedPrompt?.response_format || {
      type: "json_schema",
      json_schema: {},
    },
    is_public: selectedPrompt?.is_public || false,
    model_name: selectedPrompt?.model_name || "Llama-3.1-8B-Instruct",
  });

  const [responseFormatText, setResponseFormatText] = useState(
    JSON.stringify(
      selectedPrompt?.response_format || {
        type: "json_schema",
        json_schema: {},
      },
      null,
      2
    )
  );

  const handleSubmit = () => {
    let finalPromptForm: any = { ...promptForm };

    if (responseFormatText.trim()) {
      try {
        const parsedResponseFormat = JSON.parse(responseFormatText);
        finalPromptForm.response_format = parsedResponseFormat;
      } catch (error) {
        console.error("Invalid response format JSON:", error);
        const { response_format, ...formWithoutResponseFormat } =
          finalPromptForm;
        finalPromptForm = formWithoutResponseFormat;
      }
    } else {
      const { response_format, ...formWithoutResponseFormat } = finalPromptForm;
      finalPromptForm = formWithoutResponseFormat;
    }

    onSubmit(finalPromptForm);
  };

  return (
    <Card
      id="edit-prompt-form"
      className="border-2 border-primary/20 bg-primary/5"
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isCreating ? "➕ Create New Prompt" : "✏️ Edit Prompt"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={promptForm.name}
              onChange={(e) =>
                setPromptForm({ ...promptForm, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Select
              value={promptForm.platform}
              onValueChange={(value) =>
                setPromptForm({ ...promptForm, platform: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discord">Discord</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="model_name">Model</Label>
            <Select
              value={promptForm.model_name}
              onValueChange={(value) =>
                setPromptForm({ ...promptForm, model_name: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a model" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.cost} - {model.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              value={promptForm.temperature}
              onChange={(e) =>
                setPromptForm({
                  ...promptForm,
                  temperature: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="top_p">Top P</Label>
            <Input
              id="top_p"
              type="number"
              step="0.1"
              min="0"
              max="1"
              value={promptForm.top_p}
              onChange={(e) =>
                setPromptForm({
                  ...promptForm,
                  top_p: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={promptForm.description}
              onChange={(e) =>
                setPromptForm({
                  ...promptForm,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="system-content">System Message</Label>
          <Textarea
            id="system-content"
            value={promptForm.messages[0]?.content || ""}
            onChange={(e) => {
              const newMessages = [...promptForm.messages];
              newMessages[0] = {
                ...newMessages[0],
                content: e.target.value,
              };
              setPromptForm({ ...promptForm, messages: newMessages });
            }}
            placeholder="Enter the system message that will frame the analysis..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="response-format">Response Format (JSON Schema)</Label>
          <Textarea
            id="response-format"
            value={responseFormatText}
            onChange={(e) => {
              const value = e.target.value;
              setResponseFormatText(value);
              try {
                const responseFormat = JSON.parse(value);
                setPromptForm({
                  ...promptForm,
                  response_format: responseFormat,
                });
              } catch (error) {
                // Keep value even if JSON is invalid during typing
              }
            }}
            placeholder='{"type": "json_schema", "json_schema": {...}}'
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Définit la structure de la réponse JSON. Laissez vide pour une
            réponse libre.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_public"
            checked={promptForm.is_public}
            onCheckedChange={(checked) =>
              setPromptForm({ ...promptForm, is_public: checked })
            }
          />
          <Label htmlFor="is_public">Make this prompt public</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="flex-1">
            {isCreating ? "Create Prompt" : "Update Prompt"}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
