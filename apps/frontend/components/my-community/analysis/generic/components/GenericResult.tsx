import React from "react";
import { AnalysisResultBase } from "../../shared/analysis-result-base";
import { GenericResultProps } from "../types";
import { useAnalysisData } from "../hooks/useAnalysisData";
import { getFieldTitle, isNewCategory } from "../utils/fieldConfig";
import { useArrayRendering } from "../hooks/useArrayRendering";
import { useValueRendering } from "../hooks/useValueRendering";

// ============
// Utilitaires locaux
// ============

// Formate le texte libre avec support markdown basique
const formatFreeText = (text: string) => {
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

// ============
// Component: GenericResult
// ------------
// DESCRIPTION: Composant intelligent pour afficher TOUS les types de résultats d'analyses
// Gère automatiquement les sorties structurées ET les réponses libres du LLM
// PARAMS: GenericResultProps
// RETURNS: JSX.Element
// ============
export function GenericResult({ result }: GenericResultProps) {
  // Tous les hooks doivent être appelés en premier, avant toute logique conditionnelle
  const { resultKey, structuredData, dataFields, isFreeText, hasData } =
    useAnalysisData(result);
  const { renderArray } = useArrayRendering();
  const { renderSimpleValue } = useValueRendering();

  console.log("🔍 result", result);

  // Fonction utilitaire pour insérer séparateurs et router vers le bon rendu
  const renderField = (
    key: string,
    value: any,
    index: number,
    fields: string[]
  ) => {
    const title = getFieldTitle(key);
    const shouldShowSeparator =
      index > 0 && isNewCategory(key, fields[index - 1]);
    return (
      <div key={key}>
        {shouldShowSeparator && (
          <div className="my-8 border-t border-gray-200"></div>
        )}
        {Array.isArray(value)
          ? renderArray(value, title, key)
          : renderSimpleValue(value, title, key)}
      </div>
    );
  };

  // Maintenant on peut faire les vérifications conditionnelles
  if (!result) return null;

  // Si pas de données d'analyse, afficher un état de chargement
  if (!hasData) {
    return (
      <AnalysisResultBase
        result={result}
        title="Analysis Result"
        key={resultKey}
      >
        <div className="space-y-6">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'analyse...</p>
            <p className="text-xs text-muted-foreground mt-2">
              ID: {resultKey}
            </p>
          </div>
        </div>
      </AnalysisResultBase>
    );
  }

  // Si c'est une réponse libre du LLM
  if (isFreeText) {
    return (
      <AnalysisResultBase
        result={{ platform: "discord" }}
        title="Analysis Result"
      >
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="prose prose-sm max-w-none">
              {formatFreeText(result)}
            </div>
          </div>
        </div>
      </AnalysisResultBase>
    );
  }

  return (
    <AnalysisResultBase result={result} title="Analysis Result" key={resultKey}>
      <div className="space-y-6">
        {/* Rendu du raisonnement en premier si présent */}
        {structuredData.reasoning && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              🧠 Raisonnement du LLM
            </h3>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
              <div className="text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
                {formatFreeText(structuredData.reasoning)}
              </div>
            </div>
          </div>
        )}

        {/* Rendu automatique de tous les champs de données */}
        {dataFields
          .filter((key) => key !== "reasoning")
          .map((key, index) => {
            const value = structuredData[key];
            return renderField(key, value, index, dataFields);
          })}

        {/* Message si aucune donnée */}
        {dataFields.length === 0 && (
          <div className="text-center p-8 text-muted-foreground">
            <p>No analysis data available</p>
          </div>
        )}

        {/* Rendu éventuel des messages utilisateur bruts si présents */}
        {/* {Array.isArray((result as any)?.userMessages) &&
          (result as any).userMessages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-semibold text-blue-700">
                  User Messages{" "}
                  {(result as any).userMessages.length
                    ? `(${(result as any).userMessages.length})`
                    : ""}
                </h3>
              </div>
              <div className="space-y-3">
                {(result as any).userMessages.map(
                  (message: any, index: number) => (
                    <div key={index} className="relative">
                      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 to-blue-400"></div>
                      <div className="ml-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {message.timestamp && (
                                <div className="text-xs text-gray-400">
                                  {new Date(message.timestamp).toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                              {typeof message === "string"
                                ? message
                                : message.content ||
                                  message.text ||
                                  JSON.stringify(message)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )} */}
      </div>
    </AnalysisResultBase>
  );
}
