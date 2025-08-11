import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { PromptForm as PromptFormType } from "../../shared/types";
import { usePromptGeneration } from "../hooks/usePromptGeneration";

interface PreviewSectionProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const PreviewSection = ({
  promptForm,
  onUpdate,
}: PreviewSectionProps) => {
  const [showFullPreview, setShowFullPreview] = useState(false);
  const {
    getRole,
    getMode,
    generateSystemMessage,
    generateResponseFormat,
    generateFinalPromptPreview,
  } = usePromptGeneration();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">
            🔍 Prévisualisation du Prompt
          </h3>
          <p className="text-sm text-muted-foreground">
            Aperçu du JSON final qui sera envoyé
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFullPreview(!showFullPreview)}
        >
          {showFullPreview ? "🔼 Masquer JSON" : "🔽 Voir JSON Complet"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Message système généré */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            🤖 Message Système Généré
          </Label>
          <div className="bg-muted/50 rounded-lg p-3 text-xs max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {generateSystemMessage(promptForm)}
            </pre>
          </div>
        </div>

        {/* Schema JSON généré */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            📋 Schema de Réponse{" "}
            {promptForm.selected_outputs &&
            promptForm.selected_outputs.length > 0
              ? "(Structuré)"
              : "(Libre)"}
          </Label>
          <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono max-h-64 overflow-y-auto">
            <pre>
              {promptForm.selected_outputs &&
              promptForm.selected_outputs.length > 0
                ? JSON.stringify(generateResponseFormat(promptForm), null, 2)
                : "// Réponse libre - Pas de schéma JSON\n// Le LLM retournera du texte libre"}
            </pre>
          </div>
        </div>

        {/* Configuration résumée */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">⚙️ Configuration</Label>
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
            <div>
              <strong>Mode:</strong>{" "}
              {promptForm.mode_id
                ? getMode(promptForm.mode_id)?.name || "Standard"
                : "Standard"}
            </div>
            <div>
              <strong>Modèle:</strong> {promptForm.model_name}
            </div>
            <div>
              <strong>Rôle:</strong>{" "}
              {promptForm.role_id
                ? getRole(promptForm.role_id)?.name || "Aucun"
                : "Aucun"}
            </div>
            <div>
              <strong>Actions:</strong>{" "}
              {promptForm.selected_actions?.length || 0} sélectionnée(s)
            </div>
            <div>
              <strong>Outputs:</strong>{" "}
              {promptForm.selected_outputs?.length || 0} sélectionné(s)
            </div>
            <div>
              <strong>Raisonnement:</strong>{" "}
              {promptForm.show_reasoning ? "Activé" : "Désactivé"}
            </div>
            <div>
              <strong>Type de réponse:</strong>{" "}
              {promptForm.selected_outputs &&
              promptForm.selected_outputs.length > 0
                ? "Structurée (JSON)"
                : "Libre"}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Complet */}
      {showFullPreview && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">
            📄 JSON Complet qui sera envoyé à la BD
          </Label>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap">
              {JSON.stringify(generateFinalPromptPreview(promptForm), null, 2)}
            </pre>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>💡</span>
            <span>
              Ceci est exactement ce qui sera sauvegardé en base de données
              quand vous cliquerez sur "Create/Update Prompt"
            </span>
          </div>
        </div>
      )}

      {/* Nom du schema si structuré */}
      {promptForm.selected_outputs &&
        promptForm.selected_outputs.length > 0 && (
          <div className="space-y-3">
            <Label htmlFor="schema-name">📝 Nom du Schema JSON</Label>
            <Input
              id="schema-name"
              value={
                promptForm.response_format?.json_schema?.name ||
                (promptForm.name
                  ? promptForm.name.replace(/\s+/g, "") + "Schema"
                  : "CustomSchema")
              }
              onChange={(e) => {
                onUpdate({
                  response_format: {
                    ...promptForm.response_format,
                    type: "json_schema",
                    json_schema: {
                      ...promptForm.response_format?.json_schema,
                      name: e.target.value,
                      schema: {
                        ...promptForm.response_format?.json_schema?.schema,
                        title: e.target.value,
                      },
                    },
                  },
                });
              }}
              placeholder="Ex: DiscordAnalysis, CommunityInsights..."
            />
            <p className="text-xs text-muted-foreground">
              Nom technique du schéma JSON (requis pour l'API)
            </p>
          </div>
        )}
    </div>
  );
};
