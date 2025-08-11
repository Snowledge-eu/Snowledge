import React from "react";
import { AnalysisResultBase } from "./shared/analysis-result-base";
import { AnalysisListBase } from "./shared/analysis-list-base";

// ============
// Types pour les composants génériques
// ============
export interface GenericResultProps {
  result: any;
}

export interface GenericListProps {
  history: any[];
  onSelect: (result: any) => void;
  promptName?: string; // Nom du prompt pour personnaliser le titre
}

// ============
// Function: GenericResult
// ------------
// DESCRIPTION: Composant pour afficher les résultats d'analyses génériques (ni summary ni trend)
// PARAMS: GenericResultProps
// RETURNS: JSX.Element
// ============
export function GenericResult({ result }: GenericResultProps) {
  if (!result) return null;

  console.log("resulzzezet", result);

  console.log("result.userMessages", result.userMessages);

  return (
    <AnalysisResultBase result={result} title="Analysis Result">
      <div className="space-y-6">
        {/* Affichage des utilisateurs notables si disponibles */}
        {result.notable_users && result.notable_users.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Notable Users</h3>
            <div className="grid gap-2">
              {result.notable_users.map((user: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {user.name || `User ${index + 1}`}
                    </p>
                    {user.reason && (
                      <p className="text-xs text-muted-foreground">
                        {user.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score de confiance si disponible */}
        {result.score && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Confidence Score:</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${result.score}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {result.score}%
              </span>
            </div>
          </div>
        )}

        {result.userMessages && result.userMessages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <h3 className="text-lg font-semibold text-blue-700">
                User Messages ({result.userMessages.length})
              </h3>
            </div>
            <div className="space-y-3">
              {result.userMessages.map((message: any, index: number) => (
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
              ))}
            </div>
          </div>
        )}
      </div>
    </AnalysisResultBase>
  );
}

// ============
// Function: GenericList
// ------------
// DESCRIPTION: Composant de liste pour les analyses génériques
// PARAMS: GenericListProps
// RETURNS: JSX.Element
// ============
export function GenericList({
  history,
  onSelect,
  promptName,
}: GenericListProps) {
  const getTitle = () => {
    if (promptName) {
      return `Past ${promptName} Analyses`;
    }
    return "Past Generic Analyses";
  };

  return (
    <AnalysisListBase
      history={history}
      onSelect={onSelect}
      analysisType="generic"
      title={getTitle()}
    />
  );
}
