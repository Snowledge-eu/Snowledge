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
import { usePromptGeneration } from "./hooks/usePromptGeneration";

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
  const { getAutoAddedFields, generateSystemMessage, generateResponseFormat, generateFinalPromptPreview } = usePromptGeneration();
  
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

  // Obtenir les champs automatiquement ajoutés
  const autoAddedFields = getAutoAddedFields(promptForm.selected_actions || []);

  // Fonction pour vérifier si un output est activé (manuellement ou automatiquement)
  const isOutputActive = (outputId: string) => {
    const isManuallySelected = promptForm.selected_outputs?.includes(outputId) || false;
    const isAutoAdded = autoAddedFields.some(
      field => field !== null && field.jsonField === outputId
    );
    return isManuallySelected || isAutoAdded;
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
    // Utiliser le hook pour générer le prompt final avec le mapping automatique
    const finalForm = generateFinalPromptPreview(promptForm);
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

            {/* Section des champs automatiquement ajoutés */}
            {autoAddedFields.length > 0 && (
              <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <h4 className="text-md font-medium text-blue-800">
                    🔄 Champs automatiquement ajoutés
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    Basé sur les Actions sélectionnées
                  </Badge>
                </div>
                <p className="text-xs text-blue-700">
                  Ces champs seront automatiquement inclus car ils correspondent aux Actions demandées :
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {autoAddedFields
                    .filter((field): field is NonNullable<typeof field> => field !== null)
                    .map(({ actionId, jsonField, output }) => (
                      <div
                        key={jsonField}
                        className="flex items-center gap-2 p-2 bg-blue-100 border border-blue-300 rounded"
                      >
                        <div className="flex-1">
                          <div className="text-xs font-medium text-blue-900">
                            {output.name}
                          </div>
                          <div className="text-xs text-blue-700">
                            Action: {actionId}
                          </div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {output.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

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
                      {categoryOutputs.map((output) => {
                        const isAutoAdded = autoAddedFields.some(
                          field => field !== null && field.jsonField === output.id
                        );
                        
                        return (
                          <div
                            key={output.id}
                            className={`flex items-start space-x-2 p-2 border rounded ${
                              isAutoAdded ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <Switch
                              id={`output_${output.id}`}
                              checked={isOutputActive(output.id)}
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
                              disabled={isAutoAdded}
                            />
                            <div className="flex-1">
                              <Label
                                htmlFor={`output_${output.id}`}
                                className={`text-xs font-medium ${
                                  isAutoAdded ? 'text-blue-700' : ''
                                }`}
                              >
                                {output.name}
                                {isAutoAdded && (
                                  <Badge variant="secondary" className="ml-1 text-xs">
                                    Auto
                                  </Badge>
                                )}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {output.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
