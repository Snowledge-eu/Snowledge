import { Label } from "@repo/ui/components/label";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { PromptForm as PromptFormType } from "../../shared/types";
import {
  AVAILABLE_MODELS,
  AVAILABLE_ROLES,
  AVAILABLE_MODES,
} from "../../shared/constants";
import { usePromptGeneration } from "../hooks/usePromptGeneration";

interface ModelSelectionProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const ModelSelection = ({
  promptForm,
  onUpdate,
}: ModelSelectionProps) => {
  const { getRole, getMode } = usePromptGeneration();

  const handleModeChange = (value: string) => {
    const mode = getMode(value);
    const recommendedModel =
      mode?.recommendedModels[0] || promptForm.model_name;
    onUpdate({
      mode_id: value,
      model_name: recommendedModel,
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mode">Mode d'Analyse</Label>
          <Select value={promptForm.mode_id} onValueChange={handleModeChange}>
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

        <div className="space-y-2">
          <Label htmlFor="role">Rôle du LLM</Label>
          <Select
            value={promptForm.role_id || "none"}
            onValueChange={(value) =>
              onUpdate({ role_id: value === "none" ? "" : value })
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

      <div className="space-y-2">
        <Label htmlFor="model_name">Model</Label>
        <Select
          value={promptForm.model_name}
          onValueChange={(value) => onUpdate({ model_name: value })}
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
    </div>
  );
};
