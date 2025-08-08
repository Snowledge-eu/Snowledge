// ============
// Exports des composants de base partagés
// ============

// Composants de base
export {
  AnalysisInputBase,
  type AnalysisInputBaseProps,
} from "./analysis-input-base";
export {
  AnalysisListBase,
  type AnalysisListBaseProps,
} from "./analysis-list-base";
export {
  AnalysisResultBase,
  type AnalysisResultBaseProps,
} from "./analysis-result-base";
export { TrendResultBase } from "./trend-result-base";
export { SummaryResultBase } from "./summary-result-base";

// Composants spécialisés pour Summary
export {
  SummaryInput,
  SummaryList,
  SummaryResult,
  type SummaryInputProps,
  type SummaryListProps,
  type SummaryResultProps,
} from "./summary-components";

// Composants spécialisés pour Trends
export {
  TrendInput,
  TrendList,
  TrendResult,
  type TrendInputProps,
  type TrendListProps,
  type TrendResultProps,
} from "./trend-components";
