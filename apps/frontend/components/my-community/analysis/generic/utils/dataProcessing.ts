import { ANALYSIS_FIELDS, SYSTEM_FIELDS } from "./fieldConfig";

// ============
// Utilitaires de traitement des données
// ============

/**
 * Détecte si c'est une réponse libre (string) ou structurée (object)
 */
export const isFreeTextResponse = (data: any): boolean => {
  return (
    typeof data === "string" && !data.startsWith("{") && !data.startsWith("[")
  );
};

/**
 * Traite les données d'analyse et extrait les données structurées
 */
export const processAnalysisData = (result: any) => {
  if (!result) return {};

  let structuredData = typeof result === "object" ? result : {};

  // Extraire les données d'analyse d'analysisData
  if (
    structuredData.analysisData &&
    typeof structuredData.analysisData === "object"
  ) {
    // Extraire les données d'analyse
    structuredData = { ...structuredData, ...structuredData.analysisData };
    // Supprimer analysisData pour éviter les doublons
    delete structuredData.analysisData;
  }

  return structuredData;
};

/**
 * Filtre les champs système et retourne les champs de données
 */
export const getDataFields = (structuredData: any): string[] => {
  const allFields = Object.keys(structuredData).filter(
    (key) => !SYSTEM_FIELDS.includes(key)
  );

  return allFields;
};

/**
 * Vérifie si les données d'analyse sont bien chargées
 */
export const hasAnalysisData = (result: any): boolean => {
  if (!result) return false;

  // Vérifier dans les données principales
  const hasMainData = ANALYSIS_FIELDS.some(
    (field) => result[field] && result[field] !== ""
  );

  console.log("🔍 hasMainData", hasMainData);

  // Vérifier dans analysisData (cas spécial)
  const hasAnalysisDataData =
    result.analysisData &&
    typeof result.analysisData === "object" &&
    !Array.isArray(result.analysisData) &&
    ANALYSIS_FIELDS.some(
      (field) => result.analysisData[field] && result.analysisData[field] !== ""
    );

  console.log("anlaisis fields", ANALYSIS_FIELDS);

  console.log("🔍 result.analysisData", result.analysisData);
  console.log("🔍 hasAnalysisDataData", hasAnalysisDataData);
  return hasMainData || hasAnalysisDataData;
};

/**
 * Génère une clé unique pour le résultat
 */
export const generateResultKey = (result: any): string => {
  return result?.id || result?._id || result?.timestamp || Date.now();
};
