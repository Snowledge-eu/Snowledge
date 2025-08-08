import {
  AnalysisInputBase,
  AnalysisListBase,
  AnalysisResultBase,
  type AnalysisInputBaseProps,
} from "./index";

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

  return <AnalysisResultBase result={result} analysisType="summary" />;
}
