import React from "react";
import { useScoreDetection } from "./useScoreDetection";

// ============
// Hook pour la détection du type de données
// ============

export type DataType =
  | "url"
  | "email"
  | "date"
  | "score"
  | "long_text"
  | "simple";

export interface DataTypeInfo {
  type: DataType;
  icon: string;
  color: string;
  textColor: string;
}

export const useDataTypeDetection = () => {
  const { isScoreValue } = useScoreDetection();

  // Détecte le type de données et retourne des métadonnées
  const getDataTypeInfo = (value: any, fieldName: string): DataTypeInfo => {
    // URLs
    if (typeof value === "string" && /^https?:\/\//.test(value)) {
      return {
        type: "url",
        icon: "🔗",
        color: "from-blue-50 to-blue-100",
        textColor: "text-blue-700",
      };
    }
    // Emails
    if (typeof value === "string" && /\S+@\S+\.\S+/.test(value)) {
      return {
        type: "email",
        icon: "📧",
        color: "from-purple-50 to-purple-100",
        textColor: "text-purple-700",
      };
    }
    // Dates (format ISO ou dates lisibles)
    if (
      typeof value === "string" &&
      !isNaN(Date.parse(value)) &&
      value.includes("-")
    ) {
      return {
        type: "date",
        icon: "📅",
        color: "from-green-50 to-green-100",
        textColor: "text-green-700",
      };
    }
    // Nombres/Scores
    if (
      (typeof value === "number" && value >= 0 && value <= 100) ||
      isScoreValue(value, fieldName) !== null
    ) {
      return {
        type: "score",
        icon: "📊",
        color: "from-indigo-50 to-indigo-100",
        textColor: "text-indigo-700",
      };
    }
    // Longs textes (plus de 100 caractères)
    if (typeof value === "string" && value.length > 100) {
      return {
        type: "long_text",
        icon: "📝",
        color: "from-gray-50 to-gray-100",
        textColor: "text-gray-700",
      };
    }

    // Valeurs simples
    return {
      type: "simple",
      icon: "💬",
      color: "from-slate-50 to-slate-100",
      textColor: "text-slate-700",
    };
  };

  return { getDataTypeInfo };
};
