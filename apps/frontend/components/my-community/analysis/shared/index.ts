// ============
// Exports des composants d'analyse
// ============

// Composants de base pour les inputs et listes
export {
  AnalysisInputBase,
  type AnalysisInputBaseProps,
} from "./analysis-input-base";
export {
  AnalysisListBase,
  type AnalysisListBaseProps,
} from "./analysis-list-base";

// Composant de base pour les résultats
export {
  AnalysisResultBase,
  type AnalysisResultBaseProps,
} from "./analysis-result-base";

// Composants spécialisés pour Summary
export {
  SummaryInput,
  SummaryList,
  SummaryResult,
  type SummaryInputProps,
  type SummaryListProps,
  type SummaryResultProps,
} from "../summary-components";

// Composants spécialisés pour Trends
export {
  TrendInput,
  TrendList,
  TrendResult,
  type TrendInputProps,
  type TrendListProps,
  type TrendResultProps,
} from "../trend-components";

// Composants communs
export { AnalysisDescription } from "./analysis-description";
export {
  PlatformIconButtons,
  PlatformIconButton,
} from "./platform-icon-buttons";
export { PlatformAndScopeRow } from "./platform-and-scope-row";
export { TimeframeBadge } from "./timeframe-badge";
