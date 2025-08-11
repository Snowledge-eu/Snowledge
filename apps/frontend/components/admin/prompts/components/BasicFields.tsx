import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { PromptForm as PromptFormType } from "../../shared/types";
import { useFormValidation } from "../hooks/useFormValidation";

interface BasicFieldsProps {
  promptForm: PromptFormType;
  onUpdate: (updates: Partial<PromptFormType>) => void;
}

export const BasicFields = ({ promptForm, onUpdate }: BasicFieldsProps) => {
  const { getFieldError } = useFormValidation();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={promptForm.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Nom de votre prompt..."
            className={!promptForm.name.trim() ? "border-red-300" : ""}
          />
          {getFieldError(promptForm, "name") && (
            <p className="text-xs text-red-500">
              {getFieldError(promptForm, "name")}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select
            value={promptForm.platform}
            onValueChange={(value) => onUpdate({ platform: value })}
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
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Décrivez l'objectif de votre prompt..."
          />
        </div>
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
              onUpdate({ temperature: parseFloat(e.target.value) })
            }
            className={
              getFieldError(promptForm, "temperature") ? "border-red-300" : ""
            }
          />
          {getFieldError(promptForm, "temperature") && (
            <p className="text-xs text-red-500">
              {getFieldError(promptForm, "temperature")}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="top_p">Top P</Label>
          <Input
            id="top_p"
            type="number"
            step="0.1"
            min="0"
            max="1"
            value={promptForm.top_p}
            onChange={(e) => onUpdate({ top_p: parseFloat(e.target.value) })}
            className={
              getFieldError(promptForm, "top_p") ? "border-red-300" : ""
            }
          />
          {getFieldError(promptForm, "top_p") && (
            <p className="text-xs text-red-500">
              {getFieldError(promptForm, "top_p")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
