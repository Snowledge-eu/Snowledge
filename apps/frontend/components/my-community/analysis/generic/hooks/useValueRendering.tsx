import React from "react";
import { useScoreDetection } from "./useScoreDetection";
import { useDataTypeDetection } from "./useDataTypeDetection";
import { useTextFormatting } from "./useTextFormatting";

// ============
// Hook pour le rendu des valeurs simples
// ============


export const useValueRendering = () => {
  const { isScoreValue, renderScoreBar } = useScoreDetection();
  const { getDataTypeInfo } = useDataTypeDetection();
  const { formatFreeText } = useTextFormatting();

  // Rend une valeur simple (string, number, etc.)
  const renderSimpleValue = (value: any, title: string, fieldName: string) => {
    if (value === null || value === undefined) return null;

    const dataInfo = getDataTypeInfo(value, fieldName);

    // Score/confiance (nombres entre 0-100)
    if (typeof value === "number" && value >= 0 && value <= 100) {
      return renderScoreBar(value, title);
    }

    // Détection de score dans les strings
    if (typeof value === "string") {
      const scoreValue = isScoreValue(value, fieldName);
      if (scoreValue !== null) {
        return renderScoreBar(scoreValue, title, value);
      }
    }

    // URLs - Rendu spécial avec lien cliquable
    if (dataInfo.type === "url") {
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <span>{dataInfo.icon}</span>
            {title}
          </h4>
          <div
            className={`p-3 bg-gradient-to-r ${dataInfo.color} rounded-lg border`}
          >
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className={`${dataInfo.textColor} hover:underline break-all`}
            >
              {value}
            </a>
          </div>
        </div>
      );
    }

    // Dates - Formatage amélioré
    if (dataInfo.type === "date") {
      const date = new Date(value);
      const formattedDate = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <span>{dataInfo.icon}</span>
            {title}
          </h4>
          <div
            className={`p-3 bg-gradient-to-r ${dataInfo.color} rounded-lg border`}
          >
            <span className={`${dataInfo.textColor} font-medium`}>
              {formattedDate}
            </span>
          </div>
        </div>
      );
    }

    // Texte long (plus de 100 caractères) - traiter comme summary/explanation
    if (dataInfo.type === "long_text") {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{dataInfo.icon}</span>
            {title}
          </h3>
          <div
            className={`p-4 bg-gradient-to-r ${dataInfo.color} rounded-lg border`}
          >
            <div
              className={`text-base leading-relaxed whitespace-pre-wrap ${dataInfo.textColor}`}
            >
              {formatFreeText(value)}
            </div>
          </div>
        </div>
      );
    }

    // Objets complexes (sentiment_by_channel, activity_level, etc.)
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span>{dataInfo.icon}</span>
            {title}
          </h3>
          <div
            className={`p-4 bg-gradient-to-r ${dataInfo.color} rounded-lg border`}
          >
            <div className="space-y-3">
              {Object.entries(value).map(([key, val], index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white/50 rounded"
                >
                  <span className="text-sm font-medium capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-sm font-semibold ${dataInfo.textColor}`}
                  >
                    {typeof val === "object"
                      ? JSON.stringify(val)
                      : String(val)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Valeur simple courte
    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <span>{dataInfo.icon}</span>
          {title}
        </h4>
        <div
          className={`p-3 bg-gradient-to-r ${dataInfo.color} rounded-lg border`}
        >
          <span className={`${dataInfo.textColor} font-medium`}>
            {String(value)}
          </span>
        </div>
      </div>
    );
  };

  return { renderSimpleValue };
};
