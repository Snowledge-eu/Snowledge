import React, { useState } from "react";
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
import {
  AVAILABLE_ROLES,
  AVAILABLE_MODES,
  AVAILABLE_ACTIONS,
  AVAILABLE_OUTPUTS,
} from "../shared/constants";
import { PromptForm as PromptFormType } from "../shared/types";

interface SimplePromptBuilderProps {
  onSubmit: (formData: PromptFormType) => void;
  onCancel?: () => void;
  title?: string;
  submitText?: string;
}

// ============
// Component: SimplePromptBuilder
// ------------
// DESCRIPTION: Composant simplifié pour que les users lambda créent leurs propres prompts
// Masque la complexité technique tout en gardant la puissance du système
// PARAMS: SimplePromptBuilderProps
// RETURNS: JSX.Element
// ============
export const SimplePromptBuilder = ({
  onSubmit,
  onCancel,
  title = "🚀 Créer mon Analyse Personnalisée",
  submitText = "Créer l'Analyse",
}: SimplePromptBuilderProps) => {
  const [promptForm, setPromptForm] = useState<PromptFormType>({
    // Champs de base
    name: "",
    description: "",
    platform: "discord",
    temperature: 0.3,
    top_p: 0.8,
    messages: [
      { role: "system", content: "" },
      { role: "user", content: "{{messages}}" },
    ],
    is_public: false,
    model_name: "Llama-3.1-8B-Instruct",

    // Nouveaux champs avancés
    role_id: "",
    mode_id: "standard",
    selected_actions: [],
    selected_outputs: [],
    show_reasoning: false,
    tools_enabled: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Génération automatique du system message basé sur les sélections
  const generateSystemMessage = () => {
    let baseMessage =
      "Tu es un assistant IA spécialisé dans l'analyse de communautés en ligne.";

    // Ajout du rôle
    if (promptForm.role_id) {
      const role = AVAILABLE_ROLES.find((r) => r.id === promptForm.role_id);
      if (role) {
        baseMessage += ` ${role.systemPromptAddition}`;
      }
    }

    // Ajout des actions
    if (promptForm.selected_actions && promptForm.selected_actions.length > 0) {
      const actions = promptForm.selected_actions
        .map((actionId) => {
          const action = AVAILABLE_ACTIONS.find((a) => a.id === actionId);
          return action?.name || actionId;
        })
        .join(", ");
      baseMessage += ` Tu dois effectuer les analyses suivantes : ${actions}.`;
    }

    // Instructions pour les outputs
    if (promptForm.selected_outputs && promptForm.selected_outputs.length > 0) {
      baseMessage += ` Ta réponse doit être structurée et inclure les éléments suivants : `;
      const outputs = promptForm.selected_outputs
        .map((outputId) => {
          const output = AVAILABLE_OUTPUTS.find((o) => o.id === outputId);
          return output?.name || outputId;
        })
        .join(", ");
      baseMessage += outputs + ".";
    }

    // Ajout du raisonnement si demandé
    if (promptForm.show_reasoning) {
      baseMessage +=
        " Inclus ton raisonnement étape par étape dans un champ 'reasoning'.";
    }

    return baseMessage;
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Générer automatiquement le system message
    const systemMessage = generateSystemMessage();
    const finalForm = {
      ...promptForm,
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: "{{messages}}" },
      ],
      // Générer automatiquement le response_format si des outputs sont sélectionnés
      response_format:
        promptForm.selected_outputs && promptForm.selected_outputs.length > 0
          ? {
              type: "json_schema",
              json_schema: {
                name: promptForm.name.replace(/\s+/g, "") || "CustomAnalysis",
                schema: {
                  title:
                    promptForm.name.replace(/\s+/g, "") || "CustomAnalysis",
                  type: "object",
                  properties: promptForm.selected_outputs.reduce(
                    (props, outputId) => {
                      const output = AVAILABLE_OUTPUTS.find(
                        (o) => o.id === outputId
                      );
                      if (output) {
                        props[outputId] = {
                          type: output.type,
                          title: output.name,
                          description: output.description,
                        };
                      }
                      return props;
                    },
                    {} as any
                  ),
                  required: promptForm.selected_outputs,
                },
              },
            }
          : undefined,
    };

    onSubmit(finalForm);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === currentStep
                ? "bg-primary text-white"
                : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step < currentStep ? "✓" : step}
          </div>
          {step < totalSteps && (
            <div
              className={`w-12 h-1 mx-2 ${
                step < currentStep ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                📝 Informations de Base
              </h3>
              <p className="text-muted-foreground">
                Donnez un nom et décrivez votre analyse
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'analyse *</Label>
                <Input
                  id="name"
                  value={promptForm.name}
                  onChange={(e) =>
                    setPromptForm({ ...promptForm, name: e.target.value })
                  }
                  placeholder="Ex: Analyse des tendances de ma communauté"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={promptForm.description}
                  onChange={(e) =>
                    setPromptForm({
                      ...promptForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Expliquez ce que vous voulez analyser et dans quel objectif..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                🎭 Perspective d'Analyse
              </h3>
              <p className="text-muted-foreground">
                Choisissez le rôle et le mode d'analyse
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rôle de l'IA</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABLE_ROLES.map((role) => (
                    <div
                      key={role.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        promptForm.role_id === role.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setPromptForm({ ...promptForm, role_id: role.id })
                      }
                    >
                      <h4 className="font-medium text-sm">{role.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mode d'analyse</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AVAILABLE_MODES.map((mode) => (
                    <div
                      key={mode.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        promptForm.mode_id === mode.id
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:border-primary/50"
                      }`}
                      onClick={() =>
                        setPromptForm({ ...promptForm, mode_id: mode.id })
                      }
                    >
                      <h4 className="font-medium text-sm">{mode.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {mode.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                ⚡ Actions à Effectuer
              </h3>
              <p className="text-muted-foreground">
                Sélectionnez les analyses que l'IA doit réaliser
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
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">
                📊 Résultats Souhaités
              </h3>
              <p className="text-muted-foreground">
                Choisissez les informations que vous voulez obtenir
              </p>
            </div>

            <div className="space-y-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryOutputs.map((output) => (
                        <div
                          key={output.id}
                          className="flex items-start space-x-2 p-2 border rounded"
                        >
                          <Switch
                            id={`output_${output.id}`}
                            checked={
                              promptForm.selected_outputs?.includes(
                                output.id
                              ) || false
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold mb-2">🔧 Options Finales</h3>
              <p className="text-muted-foreground">
                Derniers réglages avant la création
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <Switch
                  id="show_reasoning"
                  checked={promptForm.show_reasoning}
                  onCheckedChange={(checked) =>
                    setPromptForm({ ...promptForm, show_reasoning: checked })
                  }
                />
                <div className="flex-1">
                  <Label htmlFor="show_reasoning" className="font-medium">
                    Afficher le raisonnement de l'IA
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Voir comment l'IA arrive à ses conclusions
                  </p>
                </div>
              </div>

              {/* Résumé des sélections */}
              <div className="bg-muted/20 p-4 rounded-lg">
                <h4 className="font-medium mb-3">📋 Résumé de votre analyse</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Nom :</strong> {promptForm.name || "Non défini"}
                  </div>
                  <div>
                    <strong>Rôle :</strong>{" "}
                    {AVAILABLE_ROLES.find((r) => r.id === promptForm.role_id)
                      ?.name || "Aucun"}
                  </div>
                  <div>
                    <strong>Mode :</strong>{" "}
                    {
                      AVAILABLE_MODES.find((m) => m.id === promptForm.mode_id)
                        ?.name
                    }
                  </div>
                  <div>
                    <strong>Actions :</strong>{" "}
                    {promptForm.selected_actions?.length || 0} sélectionnée(s)
                  </div>
                  <div>
                    <strong>Résultats :</strong>{" "}
                    {promptForm.selected_outputs?.length || 0} élément(s)
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepIndicator()}
        {renderStep()}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            ← Précédent
          </Button>

          <div className="flex gap-2">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Annuler
              </Button>
            )}

            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} disabled={!promptForm.name}>
                {submitText}
              </Button>
            ) : (
              <Button onClick={handleNext}>Suivant →</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
