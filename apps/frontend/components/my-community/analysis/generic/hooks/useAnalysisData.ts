import { useEffect } from "react";
import {
  processAnalysisData,
  getDataFields,
  hasAnalysisData,
  generateResultKey,
  isFreeTextResponse,
} from "../utils/dataProcessing";
import { sortFieldsByImportance } from "../utils/fieldConfig";

// ============
// Hook pour la logique métier des données d'analyse
// ============

export const useAnalysisData = (result: any) => {
  // Générer une clé unique pour forcer le re-render
  const resultKey = generateResultKey(result);

  // Debug: Diagnostiquer le problème de cache
  useEffect(() => {
    console.log("🔄 GenericResult - Component re-rendered with new result");
    console.log("🆔 GenericResult - Result ID:", resultKey);
    console.log("📊 GenericResult - Result type:", typeof result);
    console.log("📊 GenericResult - Result keys:", Object.keys(result || {}));
    console.log("📊 GenericResult - Full result object:", result);

    // Vérifier si on a des données d'analyse
    const hasData = hasAnalysisData(result);
    console.log("📊 GenericResult - Has analysis data:", hasData);
  }, [resultKey, result]);

  // Traiter les données d'analyse
  const structuredData = processAnalysisData(result);
  const dataFields = sortFieldsByImportance(getDataFields(structuredData));

  // Vérifier si c'est une réponse libre
  const isFreeText = isFreeTextResponse(result);

  // Vérifier si on a des données d'analyse
  const hasData = hasAnalysisData(result);

  return {
    resultKey,
    structuredData,
    dataFields,
    isFreeText,
    hasData,
  };
};
