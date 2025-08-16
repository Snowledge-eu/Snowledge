import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Switch } from "@repo/ui/components/switch";
import { Label } from "@repo/ui/components/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Prompt, PromptForm as PromptFormType } from "../shared/types";
import { usePromptGeneration } from "./hooks/usePromptGeneration";
import { useFormValidation } from "./hooks/useFormValidation";
import { BasicFields } from "./components/BasicFields";
import { ModelSelection } from "./components/ModelSelection";
import { ActionsSection } from "./components/ActionsSection";
import { OutputsSection } from "./components/OutputsSection";
import { PreviewSection } from "./components/PreviewSection";

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
  const { generateSystemMessage, generateResponseFormat } =
    usePromptGeneration();
  const { isFormValid } = useFormValidation();

  const [promptForm, setPromptForm] = useState<PromptFormType>({
    // Champs de base
    name: selectedPrompt?.name || "",
    description: selectedPrompt?.description || "",
    platform: selectedPrompt?.platform || "discord",
    temperature: selectedPrompt?.temperature || 0.3,
    top_p: selectedPrompt?.top_p || 0.8,
    messages: selectedPrompt?.messages || [
      { role: "system", content: "" },
      { role: "user", content: "{{messages}}" },
    ],
    response_format: selectedPrompt?.response_format,
    is_public: selectedPrompt?.is_public || false,
    model_name: selectedPrompt?.model_name || "Llama-3.1-8B-Instruct",

    // Nouveaux champs avancés
    role_id: selectedPrompt?.role_id || "",
    mode_id: selectedPrompt?.mode_id || "standard",
    selected_actions: selectedPrompt?.selected_actions || [],
    selected_outputs: selectedPrompt?.selected_outputs || [],
    show_reasoning: selectedPrompt?.show_reasoning || false,
    tools_enabled: selectedPrompt?.tools_enabled || false,
  });

  // Réinitialiser l'état du formulaire quand on change de prompt
  useEffect(() => {
    const defaultForm: PromptFormType = {
      name: selectedPrompt?.name || "",
      description: selectedPrompt?.description || "",
      platform: selectedPrompt?.platform || "discord",
      temperature: selectedPrompt?.temperature || 0.3,
      top_p: selectedPrompt?.top_p || 0.8,
      messages: selectedPrompt?.messages || [
        { role: "system", content: "" },
        { role: "user", content: "{{messages}}" },
      ],
      response_format: selectedPrompt?.response_format,
      is_public: selectedPrompt?.is_public || false,
      model_name: selectedPrompt?.model_name || "Llama-3.1-8B-Instruct",
      role_id: selectedPrompt?.role_id || "",
      mode_id: selectedPrompt?.mode_id || "standard",
      selected_actions: selectedPrompt?.selected_actions || [],
      selected_outputs: selectedPrompt?.selected_outputs || [],
      show_reasoning: selectedPrompt?.show_reasoning || false,
      tools_enabled: selectedPrompt?.tools_enabled || false,
    };

    setPromptForm(defaultForm);
  }, [selectedPrompt, isCreating, isEditing]);

  const handleUpdate = (updates: Partial<PromptFormType>) => {
    setPromptForm((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = () => {
    if (!isFormValid(promptForm)) {
      alert("Veuillez corriger les erreurs du formulaire");
      return;
    }

    let finalPromptForm: any = { ...promptForm };

    // Générer automatiquement le message système
    const generatedSystemMessage = generateSystemMessage(promptForm);
    const updatedMessages = [...finalPromptForm.messages];
    updatedMessages[0] = {
      ...updatedMessages[0],
      content: generatedSystemMessage,
    };
    finalPromptForm.messages = updatedMessages;

    // Générer automatiquement le response_format basé sur les selected_outputs
    const generatedResponseFormat = generateResponseFormat(promptForm);

    if (generatedResponseFormat) {
      finalPromptForm.response_format = generatedResponseFormat;
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
      <CardContent className="space-y-6">
        {/* Champs de base */}
        <BasicFields promptForm={promptForm} onUpdate={handleUpdate} />

        {/* Sélection du modèle et configuration */}
        <ModelSelection promptForm={promptForm} onUpdate={handleUpdate} />

        {/*Module d'analyse pré-configurés */}
        <ActionsSection promptForm={promptForm} onUpdate={handleUpdate} />

        {/* Outputs structurés */}
        <OutputsSection promptForm={promptForm} onUpdate={handleUpdate} />

        {/* Prévisualisation */}
        <PreviewSection promptForm={promptForm} onUpdate={handleUpdate} />

        {/* Option publique */}
        <div className="flex items-center space-x-2">
          <Switch
            id="is_public"
            checked={promptForm.is_public}
            onCheckedChange={(checked) => handleUpdate({ is_public: checked })}
          />
          <Label htmlFor="is_public">Make this prompt public</Label>
        </div>

        {/* Boutons d'action */}
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
