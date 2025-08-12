import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { Badge } from "@repo/ui/components/badge";
import { PromptForm as PromptFormType } from "../../shared/types";
import { AVAILABLE_OUTPUTS } from "../../shared/constants";
import { usePromptGeneration } from "../hooks/usePromptGeneration";

interface OutputsSectionProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const OutputsSection = ({
  promptForm,
  onUpdate,
}: OutputsSectionProps) => {
  const { getAutoAddedFields } = usePromptGeneration();

  const handleOutputToggle = (outputId: string, checked: boolean) => {
    const currentOutputs = promptForm.selected_outputs || [];
    const newOutputs = checked
      ? [...currentOutputs, outputId]
      : currentOutputs.filter((o) => o !== outputId);

    onUpdate({ selected_outputs: newOutputs });
  };

  const categories = [
    "sentiment",
    "users",
    "activity",
    "topics",
    "metrics",
    "moderation",
    "support",
    "network",
    "feedback",
  ];

  const getCategoryIcon = (category: string) => {
    const icons = {
      sentiment: "😊 Sentiment",
      users: "👥 Utilisateurs",
      activity: "📈 Activité",
      topics: "💬 Sujets",
      metrics: "📊 Métriques",
      moderation: "🛡️ Modération",
      support: "🎧 Support",
      network: "🔗 Réseau",
      feedback: "💭 Feedback",
    };
    return icons[category as keyof typeof icons] || category;
  };

  // Obtenir les champs automatiquement ajoutés
  const autoAddedFields = getAutoAddedFields(promptForm.selected_actions || []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">📊 Outputs Structurés</h3>
        <p className="text-sm text-muted-foreground">
          Éléments qui seront présents dans la réponse JSON
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
            Ces champs seront automatiquement inclus dans le JSON schema car ils correspondent aux Actions demandées :
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

      <div className="grid grid-cols-1 gap-4">
        {categories.map((category) => {
          const categoryOutputs = AVAILABLE_OUTPUTS.filter(
            (output) => output.category === category
          );
          if (categoryOutputs.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium capitalize text-primary">
                {getCategoryIcon(category)}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                        checked={
                          promptForm.selected_outputs?.includes(output.id) ||
                          false
                        }
                        onCheckedChange={(checked) =>
                          handleOutputToggle(output.id, checked)
                        }
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
                        <Badge variant="outline" className="text-xs mt-1">
                          {output.type}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Section Options avancées */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">🔧 Options Avancées</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="show_reasoning"
              checked={promptForm.show_reasoning}
              onCheckedChange={(checked) =>
                onUpdate({ show_reasoning: checked })
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
                onUpdate({ tools_enabled: checked })
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
    </div>
  );
};
