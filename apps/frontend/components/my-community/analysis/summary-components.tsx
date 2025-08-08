import {
  AnalysisInputBase,
  AnalysisListBase,
  AnalysisResultBase,
  type AnalysisInputBaseProps,
} from "./shared/index";
import { CheckCircle2 } from "lucide-react";

// ============
// Types pour les summaries
// ============
export interface SummaryInputProps
  extends Omit<AnalysisInputBaseProps, "analysisType"> {}

export interface SummaryListProps {
  history: any[];
  onSelect: (result: any) => void;
}

export interface SummaryResultProps {
  summary: string;
  action_points: string[];
  timeframe?: string;
  activityLevel?: "Low" | "Medium" | "High";
  notable_users?: string[];
  platform?: string;
  scope?: string;
}

// ============
// Function: SummaryInput
// ------------
// DESCRIPTION: Composant d'input pour les analyses de summary
// PARAMS: SummaryInputProps
// RETURNS: JSX.Element
// ============
export function SummaryInput(props: SummaryInputProps) {
  return <AnalysisInputBase {...props} analysisType="summary" />;
}

// ============
// Function: SummaryList
// ------------
// DESCRIPTION: Composant de liste pour les analyses de summary
// PARAMS: SummaryListProps
// RETURNS: JSX.Element
// ============
export function SummaryList({ history, onSelect }: SummaryListProps) {
  return (
    <AnalysisListBase
      history={history}
      onSelect={onSelect}
      analysisType="summary"
    />
  );
}

// ============
// Function: SummaryResult
// ------------
// DESCRIPTION: Composant de résultat pour les analyses de summary
// PARAMS: SummaryResultProps
// RETURNS: JSX.Element
// ============
export function SummaryResult({
  summary,
  action_points,
  timeframe,
  activityLevel,
  notable_users,
  platform,
  scope,
}: SummaryResultProps) {
  const result = {
    summary,
    action_points,
    timeframe,
    activityLevel,
    notable_users,
    platform,
    scope,
  };

  return (
    <AnalysisResultBase result={result} title="Summary Analysis">
      <div>
        <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">
          Summary
        </h3>
        <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
          {result.summary}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">
          Action Points
        </h3>
        <ul className="list-disc list-inside space-y-3">
          {result.action_points?.map((point: string, idx: number) => (
            <li
              key={idx}
              className="text-base md:text-lg flex items-start gap-3 font-medium"
            >
              <CheckCircle2 size={20} className="text-primary mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnalysisResultBase>
  );
}
