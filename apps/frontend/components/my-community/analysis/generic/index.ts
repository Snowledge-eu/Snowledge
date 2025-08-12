// ============
// Exports du module generic
// ============

// Composants
export { GenericResult, GenericList } from "./components";

// Types
export type {
  GenericResultProps,
  GenericListProps,
  DataTypeInfo,
  FieldConfig,
  PriorityOrder,
  CategoryMap,
} from "./types";

// Hooks
export { useAnalysisData } from "./hooks/useAnalysisData";
export { useFieldRendering } from "./hooks/useFieldRendering";
export { useScoreDetection } from "./hooks/useScoreDetection";
export { useDataTypeDetection } from "./hooks/useDataTypeDetection";

// Utilitaires
export {
  FIELD_CONFIG,
  PRIORITY_ORDER,
  CATEGORY_MAP,
  SYSTEM_FIELDS,
  ANALYSIS_FIELDS,
  sortFieldsByImportance,
  isNewCategory,
  getFieldTitle,
} from "./utils/fieldConfig";

export {
  isFreeTextResponse,
  processAnalysisData,
  getDataFields,
  hasAnalysisData,
  generateResultKey,
} from "./utils/dataProcessing";
