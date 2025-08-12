import React from "react";

// ============
// Hook pour la détection et le rendu des scores
// ============

export const useScoreDetection = () => {
  // Détecte si une valeur string représente un score/pourcentage
  const isScoreValue = (value: string, fieldName: string): number | null => {
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

  // Fonction dédiée pour rendre les barres de score
  const renderScoreBar = (value: number, title: string, originalValue?: string) => {
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

  return { isScoreValue, renderScoreBar };
};
