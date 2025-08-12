// ============
// RE-EXPORT DU SYSTÈME UNIFIÉ
// ============
// Ce fichier est maintenant un re-export du système unifié
// Toute la logique se trouve dans fieldDefinitions.ts

// Exports de types
export type {
  FieldType,
  FieldCategory,
  FieldDefinition,
} from "./fieldDefinitions";

// Exports de valeurs
export {
  // Configurations générées automatiquement
  FIELD_CONFIG,
  PRIORITY_ORDER,
  CATEGORY_MAP,
  AVAILABLE_OUTPUTS,

  // Utilitaires
  sortFieldsByImportance,
  isNewCategory,
  getFieldTitle,

  // Champs système
  SYSTEM_FIELDS,
  ANALYSIS_FIELDS,

  // Fonctions utilitaires
  getFieldDefinition,
  getFieldsByCategory,
  getFieldsByType,

  // Source de vérité
  ALL_FIELDS,
} from "./fieldDefinitions";
