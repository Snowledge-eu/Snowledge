import { Label } from "@repo/ui/components/label";
import { Switch } from "@repo/ui/components/switch";
import { PromptForm as PromptFormType } from "../../shared/types";
import { AVAILABLE_ACTIONS } from "../../shared/constants";

interface ActionsSectionProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const ActionsSection = ({
  promptForm,
  onUpdate,
}: ActionsSectionProps) => {
  const handleActionToggle = (actionId: string, checked: boolean) => {
    const currentActions = promptForm.selected_actions || [];
    const newActions = checked
      ? [...currentActions, actionId]
      : currentActions.filter((a) => a !== actionId);

    onUpdate({ selected_actions: newActions });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">
          ⚡ Module d'analyse pré-configurés
        </h3>
        <p className="text-sm text-muted-foreground">
          Contexte, objectifs et actions à réalisées
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
              onCheckedChange={(checked) =>
                handleActionToggle(action.id, checked)
              }
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
};
