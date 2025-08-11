import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { Badge } from "@repo/ui/components/badge";
import { PromptForm as PromptFormType } from "../../shared/types";
import { AVAILABLE_OUTPUTS } from "../../shared/constants";

interface OutputsSectionProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const OutputsSection = ({
  promptForm,
  onUpdate,
}: OutputsSectionProps) => {
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

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">📊 Outputs Structurés</h3>
        <p className="text-sm text-muted-foreground">
          Éléments qui seront présents dans la réponse JSON
        </p>
      </div>

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
                      onCheckedChange={(checked) =>
                        handleOutputToggle(output.id, checked)
                      }
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
