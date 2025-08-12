import React from "react";
import { DataTypeInfo } from "../types";

// ============
// Utilitaires de rendu des champs
// ============

/**
 * Formate le texte libre avec support markdown basique
 */
export const formatFreeText = (text: string) => {
  return text.split("\n\n").map((paragraph, index) => (
    <div key={index} className="mb-4 text-base leading-relaxed">
      {paragraph.split("\n").map((line, lineIndex) => {
        // Support pour les titres markdown
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <h3
              key={lineIndex}
              className="text-lg font-semibold text-primary mb-2"
            >
              {line.slice(2, -2)}
            </h3>
          );
        }
        // Support pour les listes
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <li key={lineIndex} className="ml-4 mb-1 list-disc">
              {line.slice(2)}
            </li>
          );
        }
        // Texte normal
        return (
          line && (
            <p key={lineIndex} className="mb-2">
              {line}
            </p>
          )
        );
      })}
    </div>
  ));
};

/**
 * Détecte si une valeur string représente un score/pourcentage
 */
export const isScoreValue = (value: string, fieldName: string): number | null => {
  // Champs connus pour être des scores
  const scoreFields = ["confidence", "score", "certainty", "probability"];
  if (!scoreFields.some((field) => fieldName.toLowerCase().includes(field))) {
    return null;
  }

  // Essayer de parser différents formats
  const cleanValue = value.toString().toLowerCase().replace(/[%\s]/g, "");

  // Format "high", "medium", "low"
  const levelMap: { [key: string]: number } = {
    high: 85,
    medium: 60,
    low: 30,
    "très élevé": 90,
    élevé: 80,
    moyen: 50,
    faible: 25,
    "très faible": 10,
  };

  if (levelMap[cleanValue]) {
    return levelMap[cleanValue];
  }

  // Format numérique
  const numValue = parseFloat(cleanValue);
  if (!isNaN(numValue)) {
    // Si c'est entre 0 et 1, convertir en pourcentage
    if (numValue >= 0 && numValue <= 1) {
      return Math.round(numValue * 100);
    }
    // Si c'est déjà un pourcentage
    if (numValue >= 0 && numValue <= 100) {
      return Math.round(numValue);
    }
  }

  return null;
};

/**
 * Détecte le type de données et retourne des métadonnées
 */
export const getDataTypeInfo = (value: any, fieldName: string): DataTypeInfo => {
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

/**
 * Rend une barre de score
 */
export const renderScoreBar = (
  value: number,
  title: string,
  originalValue?: string
) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-blue-500 to-indigo-500";
    if (score >= 40) return "from-yellow-500 to-orange-500";
    return "from-red-500 to-pink-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-700";
    if (score >= 60) return "text-indigo-700";
    if (score >= 40) return "text-orange-700";
    return "text-red-700";
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
      <span className="text-sm font-medium">{title}:</span>
      <div className="flex items-center gap-2 flex-1">
        <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getScoreColor(value)} transition-all duration-500 ease-out`}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className={`text-sm font-semibold ${getScoreTextColor(value)}`}>
          {originalValue || `${value}%`}
        </span>
      </div>
    </div>
  );
};
