import { useState, useEffect } from "react";
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
import { Badge } from "@repo/ui/components/badge";
import { Prompt, PromptForm as PromptFormType } from "../shared/types";
import {
  AVAILABLE_MODELS,
  AVAILABLE_ROLES,
  AVAILABLE_MODES,
  AVAILABLE_ACTIONS,
  AVAILABLE_OUTPUTS,
} from "../shared/constants";

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
  const [showFullPreview, setShowFullPreview] = useState(false);
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

  // Réinitialiser l'état du formulaire quand on change de mode ou de prompt sélectionné
  useEffect(() => {
    const defaultForm: PromptFormType = {
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
    };

    setPromptForm(defaultForm);
  }, [selectedPrompt, isCreating, isEditing]);

  const handleSubmit = () => {
    // Validation de base
    if (!promptForm.name.trim()) {
      alert("Le nom du prompt est requis");
      return;
    }

    let finalPromptForm: any = { ...promptForm };

    // Générer automatiquement le message système
    const generatedSystemMessage = generateSystemMessage();
    const updatedMessages = [...finalPromptForm.messages];
    updatedMessages[0] = {
      ...updatedMessages[0],
      content: generatedSystemMessage,
    };
    finalPromptForm.messages = updatedMessages;

    // Générer automatiquement le response_format basé sur les selected_outputs
    const generatedResponseFormat = generateResponseFormat();

    if (generatedResponseFormat) {
      // Si on a des outputs sélectionnés, utiliser le schema généré
      finalPromptForm.response_format = generatedResponseFormat;
    } else {
      // Sinon, supprimer le response_format pour une réponse libre
      const { response_format, ...formWithoutResponseFormat } = finalPromptForm;
      finalPromptForm = formWithoutResponseFormat;
    }

    onSubmit(finalPromptForm);
  };

  // Fonctions utilitaires pour obtenir les informations d'un élément
  const getRole = (id: string) => AVAILABLE_ROLES.find((r) => r.id === id);
  const getMode = (id: string) => AVAILABLE_MODES.find((m) => m.id === id);
  const getAction = (id: string) => AVAILABLE_ACTIONS.find((a) => a.id === id);
  const getOutput = (id: string) => AVAILABLE_OUTPUTS.find((o) => o.id === id);

  // Générer un aperçu complet de ce qui sera envoyé
  const generateFinalPromptPreview = () => {
    const generatedResponseFormat = generateResponseFormat();
    const generatedSystemMessage = generateSystemMessage();

    return {
      name: promptForm.name,
      description: promptForm.description,
      platform: promptForm.platform,
      model_name: promptForm.model_name,
      temperature: promptForm.temperature,
      top_p: promptForm.top_p,
      messages: [
        { role: "system", content: generatedSystemMessage },
        { role: "user", content: "{{messages}}" },
      ],
      response_format: generatedResponseFormat,
      is_public: promptForm.is_public,
      // Nouveaux champs
      role_id: promptForm.role_id,
      mode_id: promptForm.mode_id,
      selected_actions: promptForm.selected_actions,
      selected_outputs: promptForm.selected_outputs,
      show_reasoning: promptForm.show_reasoning,
      tools_enabled: promptForm.tools_enabled,
    };
  };

  // Générer automatiquement le message système basé sur le rôle et les actions
  const generateSystemMessage = () => {
    let systemMessage =
      "You are an AI assistant specialized in analyzing community data.";

    // Ajouter le contexte du rôle
    if (promptForm.role_id) {
      const selectedRole = getRole(promptForm.role_id);
      if (selectedRole) {
        systemMessage += ` ${selectedRole.systemPromptAddition}`;
      }
    }

    // Ajouter les actions spécifiques
    if (promptForm.selected_actions && promptForm.selected_actions.length > 0) {
      const actionDescriptions = promptForm.selected_actions
        .map((actionId) => {
          const action = getAction(actionId);
          return action ? action.description : null;
        })
        .filter(Boolean);

      if (actionDescriptions.length > 0) {
        systemMessage +=
          "\n\nYour specific tasks include:\n" +
          actionDescriptions.map((desc) => `- ${desc}`).join("\n");
      }
    }

    // Ajouter les instructions pour les outputs structurés
    if (promptForm.selected_outputs && promptForm.selected_outputs.length > 0) {
      const outputNames = promptForm.selected_outputs
        .map((outputId) => {
          const output = getOutput(outputId);
          return output ? output.name : null;
        })
        .filter(Boolean);

      systemMessage +=
        "\n\nProvide your analysis in JSON format including these elements:\n" +
        outputNames.map((name) => `- ${name}`).join("\n");
    }

    // Ajouter l'instruction pour le raisonnement
    if (promptForm.show_reasoning) {
      systemMessage +=
        "\n\nInclude a 'reasoning' field explaining your analytical process step by step.";
    }

    return systemMessage;
  };

  // Générer automatiquement le schema basé sur les selected_outputs
  const generateResponseFormat = () => {
    if (
      !promptForm.selected_outputs ||
      promptForm.selected_outputs.length === 0
    ) {
      return undefined; // Pas de schema si aucun output sélectionné
    }

    const properties: any = {};
    const required: string[] = [];

    promptForm.selected_outputs.forEach((outputId) => {
      const output = getOutput(outputId);
      if (output) {
        required.push(outputId);

        switch (output.type) {
          case "string":
            properties[outputId] = {
              type: "string",
              title: output.name,
              description: output.description,
            };
            break;
          case "number":
            properties[outputId] = {
              type: "number",
              title: output.name,
              description: output.description,
            };
            break;
          case "boolean":
            properties[outputId] = {
              type: "boolean",
              title: output.name,
              description: output.description,
            };
            break;
          case "array":
            properties[outputId] = {
              type: "array",
              items: { type: "string" },
              title: output.name,
              description: output.description,
            };
            break;
          case "object":
            properties[outputId] = {
              type: "object",
              title: output.name,
              description: output.description,
            };
            break;
        }
      }
    });

    // Ajouter le raisonnement si activé
    if (promptForm.show_reasoning) {
      properties.reasoning = {
        type: "string",
        title: "Raisonnement du LLM",
        description: "Étapes de raisonnement suivies par le LLM",
      };
      required.push("reasoning");
    }

    // Générer un nom automatique basé sur le nom du prompt
    const schemaName = promptForm.name
      ? promptForm.name.replace(/\s+/g, "") + "Schema"
      : "CustomSchema";

    return {
      type: "json_schema" as const,
      json_schema: {
        name: promptForm.response_format?.json_schema?.name || schemaName,
        schema: {
          type: "object",
          title: promptForm.response_format?.json_schema?.name || schemaName,
          properties,
          required,
        },
      },
    };
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
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={promptForm.name}
              onChange={(e) =>
                setPromptForm({ ...promptForm, name: e.target.value })
              }
              placeholder="Nom de votre prompt..."
              className={!promptForm.name.trim() ? "border-red-300" : ""}
            />
            {!promptForm.name.trim() && (
              <p className="text-xs text-red-500">Le nom est requis</p>
            )}
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
              placeholder="Décrivez l'objectif de votre prompt..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mode">Mode d'Analyse</Label>
            <Select
              value={promptForm.mode_id}
              onValueChange={(value) => {
                const mode = getMode(value);
                const recommendedModel =
                  mode?.recommendedModels[0] || promptForm.model_name;
                setPromptForm({
                  ...promptForm,
                  mode_id: value,
                  model_name: recommendedModel,
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODES.map((mode) => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{mode.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {mode.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
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
                {AVAILABLE_MODELS.filter((model) => {
                  if (!promptForm.mode_id) return true;
                  return model.mode === promptForm.mode_id;
                }).map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.cost} - {model.description}
                      </span>
                      <Badge variant="secondary" className="text-xs mt-1 w-fit">
                        {model.mode}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {promptForm.mode_id && (
              <p className="text-xs text-muted-foreground">
                Modèles recommandés pour le mode "
                {getMode(promptForm.mode_id)?.name}"
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rôle du LLM</Label>
            <Select
              value={promptForm.role_id || "none"}
              onValueChange={(value) =>
                setPromptForm({
                  ...promptForm,
                  role_id: value === "none" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un rôle..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun rôle spécifique</SelectItem>
                {AVAILABLE_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{role.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-600">ℹ️</span>
            <h4 className="text-sm font-medium text-blue-800">
              Message Système Automatique
            </h4>
          </div>
          <p className="text-xs text-blue-600">
            Le message système sera généré automatiquement en fonction du rôle,
            des actions et des outputs sélectionnés. Vous pouvez voir la
            prévisualisation dans la section ci-dessous.
          </p>
        </div>

        {/* Section Actions */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">⚡ Actions du LLM</h3>
            <p className="text-sm text-muted-foreground">
              Choisissez les analyses que le LLM doit effectuer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AVAILABLE_ACTIONS.map((action) => (
              <div
                key={action.id}
                className="flex items-start space-x-3 p-3 border rounded-lg"
              >
                <Switch
                  id={`action_${action.id}`}
                  checked={
                    promptForm.selected_actions?.includes(action.id) || false
                  }
                  onCheckedChange={(checked) => {
                    const currentActions = promptForm.selected_actions || [];
                    if (checked) {
                      setPromptForm({
                        ...promptForm,
                        selected_actions: [...currentActions, action.id],
                      });
                    } else {
                      setPromptForm({
                        ...promptForm,
                        selected_actions: currentActions.filter(
                          (a) => a !== action.id
                        ),
                      });
                    }
                  }}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`action_${action.id}`}
                    className="text-sm font-medium"
                  >
                    {action.name}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section Outputs */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">📊 Outputs Structurés</h3>
            <p className="text-sm text-muted-foreground">
              Éléments qui seront présents dans la réponse JSON
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              "sentiment",
              "users",
              "activity",
              "topics",
              "metrics",
              "moderation",
              "support",
              "network",
              "feedback",
            ].map((category) => {
              const categoryOutputs = AVAILABLE_OUTPUTS.filter(
                (output) => output.category === category
              );
              if (categoryOutputs.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h4 className="text-md font-medium capitalize text-primary">
                    {category === "sentiment" && "😊 Sentiment"}
                    {category === "users" && "👥 Utilisateurs"}
                    {category === "activity" && "📈 Activité"}
                    {category === "topics" && "💬 Sujets"}
                    {category === "metrics" && "📊 Métriques"}
                    {category === "moderation" && "🛡️ Modération"}
                    {category === "support" && "🎧 Support"}
                    {category === "network" && "🔗 Réseau"}
                    {category === "feedback" && "💭 Feedback"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {categoryOutputs.map((output) => (
                      <div
                        key={output.id}
                        className="flex items-start space-x-2 p-2 border rounded"
                      >
                        <Switch
                          id={`output_${output.id}`}
                          checked={
                            promptForm.selected_outputs?.includes(output.id) ||
                            false
                          }
                          onCheckedChange={(checked) => {
                            const currentOutputs =
                              promptForm.selected_outputs || [];
                            if (checked) {
                              setPromptForm({
                                ...promptForm,
                                selected_outputs: [
                                  ...currentOutputs,
                                  output.id,
                                ],
                              });
                            } else {
                              setPromptForm({
                                ...promptForm,
                                selected_outputs: currentOutputs.filter(
                                  (o) => o !== output.id
                                ),
                              });
                            }
                          }}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`output_${output.id}`}
                            className="text-xs font-medium"
                          >
                            {output.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {output.description}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {output.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Options avancées */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">🔧 Options Avancées</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="show_reasoning"
                checked={promptForm.show_reasoning}
                onCheckedChange={(checked) =>
                  setPromptForm({ ...promptForm, show_reasoning: checked })
                }
              />
              <Label htmlFor="show_reasoning">
                Afficher le raisonnement du LLM
              </Label>
              <p className="text-xs text-muted-foreground">
                Inclut les étapes de raisonnement dans la réponse
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="tools_enabled"
                checked={promptForm.tools_enabled}
                onCheckedChange={(checked) =>
                  setPromptForm({ ...promptForm, tools_enabled: checked })
                }
                disabled
              />
              <Label htmlFor="tools_enabled" className="text-muted-foreground">
                Activer les outils (bientôt disponible)
              </Label>
              <p className="text-xs text-muted-foreground">
                Permet au LLM d'utiliser des outils externes
              </p>
            </div>
          </div>
        </div>

        {/* Section Prévisualisation */}
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
                  {generateSystemMessage()}
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
                    ? JSON.stringify(generateResponseFormat(), null, 2)
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
                  {JSON.stringify(generateFinalPromptPreview(), null, 2)}
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
                    setPromptForm({
                      ...promptForm,
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
