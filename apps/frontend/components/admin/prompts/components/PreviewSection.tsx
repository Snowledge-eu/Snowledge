import { useState, useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
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
  const [isEditingJson, setIsEditingJson] = useState(false);
  const [jsonContent, setJsonContent] = useState("");
  const { getRole, getMode, generateFinalPromptPreview } =
    usePromptGeneration();

  // Initialiser le contenu JSON quand on affiche le preview
  const handleShowFullPreview = () => {
    if (!showFullPreview) {
      const generatedJson = generateFinalPromptPreview(promptForm);
      setJsonContent(JSON.stringify(generatedJson, null, 2));
    }
    setShowFullPreview(!showFullPreview);
  };

  // Appliquer les modifications JSON
  const handleApplyJsonChanges = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);

      // Mettre à jour le formulaire avec les données du JSON
      onUpdate({
        name: parsedJson.name || promptForm.name,
        description: parsedJson.description || promptForm.description,
        platform: parsedJson.platform || promptForm.platform,
        model_name: parsedJson.model_name || promptForm.model_name,
        temperature: parsedJson.temperature || promptForm.temperature,
        top_p: parsedJson.top_p || promptForm.top_p,
        messages: parsedJson.messages || promptForm.messages,
        response_format:
          parsedJson.response_format || promptForm.response_format,
        is_public: parsedJson.is_public ?? promptForm.is_public,
        role_id: parsedJson.role_id || promptForm.role_id,
        mode_id: parsedJson.mode_id || promptForm.mode_id,
        selected_actions:
          parsedJson.selected_actions || promptForm.selected_actions,
        selected_outputs:
          parsedJson.selected_outputs || promptForm.selected_outputs,
        show_reasoning: parsedJson.show_reasoning ?? promptForm.show_reasoning,
        tools_enabled: parsedJson.tools_enabled ?? promptForm.tools_enabled,
      });

      // Garder le contenu JSON modifié affiché
      setIsEditingJson(false);
    } catch (error) {
      alert("Erreur dans le format JSON. Veuillez vérifier la syntaxe.");
    }
  };

  // Annuler les modifications JSON
  const handleCancelJsonChanges = () => {
    const generatedJson = generateFinalPromptPreview(promptForm);
    setJsonContent(JSON.stringify(generatedJson, null, 2));
    setIsEditingJson(false);
  };

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
        <Button variant="outline" size="sm" onClick={handleShowFullPreview}>
          {showFullPreview ? "🔼 Masquer JSON" : "🔽 Voir JSON Complet"}
        </Button>
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
            <strong>Actions:</strong> {promptForm.selected_actions?.length || 0}{" "}
            sélectionnée(s)
          </div>
          <div>
            <strong>Outputs:</strong> {promptForm.selected_outputs?.length || 0}{" "}
            sélectionné(s)
          </div>
          <div>
            <strong>Raisonnement:</strong>{" "}
            {promptForm.show_reasoning ? "Activé" : "Désactivé"}
          </div>
        </div>
      </div>

      {/* JSON Complet */}
      {showFullPreview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              📄 JSON Complet qui sera envoyé à la BD
            </Label>
            <div className="flex gap-2">
              {!isEditingJson ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingJson(true)}
                >
                  ✏️ Éditer JSON
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelJsonChanges}
                  >
                    ❌ Annuler
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleApplyJsonChanges}
                  >
                    ✅ Appliquer
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isEditingJson ? (
            <div className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{jsonContent}</pre>
            </div>
          ) : (
            <div className="space-y-2">
              <Textarea
                value={jsonContent}
                onChange={(e) => setJsonContent(e.target.value)}
                className="bg-gray-900 text-green-400 font-mono text-xs min-h-96"
                placeholder="Modifiez le JSON ici..."
              />
              <div className="text-xs text-muted-foreground">
                💡 Modifiez directement le JSON. Les changements seront
                appliqués au formulaire quand vous cliquerez sur "Appliquer".
              </div>
            </div>
          )}

          {!isEditingJson && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>💡</span>
              <span>
                Ceci est exactement ce qui sera sauvegardé en base de données
                quand vous cliquerez sur "Create/Update Prompt"
              </span>
            </div>
          )}
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
