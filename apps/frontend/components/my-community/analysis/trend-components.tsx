import {
  AnalysisInputBase,
  AnalysisListBase,
  type AnalysisInputBaseProps,
} from "./shared/index";

import { TrendResult } from "./trend-result";

// ============
// Types pour les trends
// ============
export interface TrendInputProps
  extends Omit<AnalysisInputBaseProps, "analysisType"> {}

export interface TrendListProps {
  history: any[];
  onSelect: (result: any) => void;
}

export interface TrendResultProps {
  result: any;
}

// ============
// Function: TrendInput
// ------------
// DESCRIPTION: Composant d'input pour les analyses de trends
// PARAMS: TrendInputProps
// RETURNS: JSX.Element
// ============
export function TrendInput(props: TrendInputProps) {
  return <AnalysisInputBase {...props} analysisType="trend" />;
}

// ============
// Function: TrendList
// ------------
// DESCRIPTION: Composant de liste pour les analyses de trends
// PARAMS: TrendListProps
// RETURNS: JSX.Element
// ============
export function TrendList({ history, onSelect }: TrendListProps) {
  return (
    <AnalysisListBase
      history={history}
      onSelect={onSelect}
      analysisType="trend"
    />
  );
}

// ============
// Function: TrendResult
// ------------
// DESCRIPTION: Composant de résultat pour les analyses de trends
// PARAMS: TrendResultProps
// RETURNS: JSX.Element
// ============
export function TrendResult({ result }: TrendResultProps) {
  return <TrendResult result={result} />;
}
