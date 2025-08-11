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
// DESCRIPTION: Composant intelligent pour afficher TOUS les types de résultats d'analyses
// Gère automatiquement les sorties structurées ET les réponses libres du LLM
// PARAMS: GenericResultProps
// RETURNS: JSX.Element
// ============
export function GenericResult({ result }: GenericResultProps) {
  if (!result) return null;

  // ============
  // Helper Functions pour le rendu dynamique
  // ============

  // Détecte si c'est une réponse libre (string) ou structurée (object)
  const isFreeTextResponse = (data: any): boolean => {
    return (
      typeof data === "string" && !data.startsWith("{") && !data.startsWith("[")
    );
  };

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

  // Rend un tableau de données de manière intelligente
  const renderArray = (data: any[], title: string, key: string) => {
    if (!data || data.length === 0) return null;

    // Si c'est un tableau de strings simples
    if (typeof data[0] === "string") {
      // Traitement spécial pour les messages (notable_messages, top_positive_messages, top_negative_messages)
      if (
        key === "notable_messages" ||
        key === "top_positive_messages" ||
        key === "top_negative_messages"
      ) {
        const colorScheme =
          key === "top_positive_messages"
            ? "green"
            : key === "top_negative_messages"
              ? "red"
              : "amber";
        const bgColor =
          colorScheme === "green"
            ? "from-green-50 to-emerald-50 border-green-200"
            : colorScheme === "red"
              ? "from-red-50 to-pink-50 border-red-200"
              : "from-amber-50 to-orange-50 border-amber-200";
        const iconColor =
          colorScheme === "green"
            ? "text-green-600"
            : colorScheme === "red"
              ? "text-red-600"
              : "text-amber-600";
        const avatarColor =
          colorScheme === "green"
            ? "bg-green-100"
            : colorScheme === "red"
              ? "bg-red-100"
              : "bg-amber-100";
        const lineColor =
          colorScheme === "green"
            ? "from-green-200 to-emerald-300"
            : colorScheme === "red"
              ? "from-red-200 to-pink-300"
              : "from-amber-200 to-orange-300";
        const dotColor =
          colorScheme === "green"
            ? "bg-green-500"
            : colorScheme === "red"
              ? "bg-red-500"
              : "bg-amber-500";
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
              {title}
            </h3>
            <div className="space-y-3">
              {data.map((message: string, index: number) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b ${lineColor}`}
                  ></div>
                  <div
                    className={`ml-6 bg-gradient-to-r ${bgColor} border rounded-xl p-4 shadow-sm`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 ${avatarColor} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        {key === "top_positive_messages" ? (
                          <svg
                            className={`w-4 h-4 ${iconColor}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : key === "top_negative_messages" ? (
                          <svg
                            className={`w-4 h-4 ${iconColor}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        ) : (
                          <svg
                            className={`w-4 h-4 ${iconColor}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                          {message}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      // Rendu standard pour les autres tableaux de strings
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            {title}
          </h3>
          <ul className="space-y-2">
            {data.map((item: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg"
              >
                <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // Si c'est un tableau d'objets (comme notable_users)
    const isUserField = key.includes("users") || key.includes("user");
    const iconColor = isUserField ? "bg-blue-100" : "bg-primary/10";
    const dotColor = isUserField ? "bg-blue-500" : "bg-primary";

    return (
      <div className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
          {title}
        </h3>
        <div className="grid gap-3">
          {data.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div
                className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center text-sm font-medium`}
              >
                {isUserField ? (
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
                ) : typeof item === "string" ? (
                  item.charAt(0).toUpperCase()
                ) : (
                  (item.name || item.user || `#${index + 1}`)
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {typeof item === "string"
                    ? item
                    : item.name ||
                      item.user ||
                      item.username ||
                      `Item ${index + 1}`}
                </p>
                {item.reason && (
                  <p className="text-xs text-muted-foreground">{item.reason}</p>
                )}
                {item.description && (
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
                {item.score && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-600 font-medium">
                      {item.score}%
                    </span>
                  </div>
                )}
                {item.activity_level && (
                  <p className="text-xs text-green-600 font-medium">
                    Activité: {item.activity_level}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  // Rend une valeur simple (string, number, etc.)
  const renderSimpleValue = (value: any, title: string, fieldName: string) => {
    if (value === null || value === undefined) return null;

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

    // Texte long (plus de 100 caractères) - traiter comme summary/explanation
    if (typeof value === "string" && value.length > 100) {
      return (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            {title}
          </h3>
          <div className="p-4 bg-muted/20 rounded-lg">
            <div className="text-base leading-relaxed whitespace-pre-wrap">
              {formatFreeText(value)}
            </div>
          </div>
        </div>
      );
    }

    // Valeur simple courte
    return (
      <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
        <span className="text-sm font-medium text-muted-foreground">
          {title}:
        </span>
        <span className="text-sm font-semibold">{String(value)}</span>
      </div>
    );
  };

  // Fonction dédiée pour rendre les barres de score
  const renderScoreBar = (
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

  // ============
  // Logique de rendu principale
  // ============

  // Si c'est une réponse libre du LLM
  if (isFreeTextResponse(result)) {
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

  // Configuration des champs connus avec leurs titres personnalisés
  const fieldConfig = {
    // Anciens champs
    summary: "Summary",
    notable_users: "Notable Users",
    notable_messages: "Notable Messages",
    explanation: "Explanation",
    confidence: "Confidence Level",
    action_points: "Action Points",
    trends: "Trending Topics",
    score: "Confidence Score",
    sentiment: "Sentiment Analysis",
    keywords: "Keywords",
    topics: "Topics",
    insights: "Insights",
    recommendations: "Recommendations",

    // Nouveaux champs structurés
    sentiment_global: "Sentiment Global",
    sentiment_by_channel: "Sentiment par Canal",
    sentiment_by_segment: "Sentiment par Segment",
    top_influential_users: "Utilisateurs Influents",
    top_active_users: "Utilisateurs Actifs",
    activity_level: "Niveau d'Activité",
    emerging_topics: "Sujets Émergents",
    top_topics: "Sujets Principaux",
    user_retention_rate: "Taux de Rétention",
    at_risk_users: "Utilisateurs à Risque",
    compliance_alerts: "Alertes de Conformité",
    unanswered_questions: "Questions sans Réponse",
    top_positive_messages: "Messages Positifs",
    top_negative_messages: "Messages Négatifs",
    user_interaction_map: "Carte des Interactions",
    feedback_clusters: "Groupes de Feedback",
    knowledge_base_gaps: "Lacunes de Connaissance",
    reasoning: "Raisonnement du LLM",
  };

  // Extraction des données structurées
  const structuredData = typeof result === "object" ? result : {};

  // Filtrer les champs système (userMessages, platform, etc.)
  const systemFields = [
    "userMessages",
    "platform",
    "scope",
    "timeframe",
    "id",
    "createdAt",
    "updatedAt",
  ];
  const dataFields = Object.keys(structuredData).filter(
    (key) => !systemFields.includes(key)
  );

  return (
    <AnalysisResultBase result={result} title="Analysis Result">
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
          .map((key) => {
            const value = structuredData[key];
            const title =
              fieldConfig[key as keyof typeof fieldConfig] ||
              key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            if (Array.isArray(value)) {
              return renderArray(value, title, key);
            } else {
              return renderSimpleValue(value, title, key);
            }
          })}

        {/* Messages utilisateur (champ système spécial) */}
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

        {/* Message si aucune donnée */}
        {dataFields.length === 0 && !result.userMessages && (
          <div className="text-center p-8 text-muted-foreground">
            <p>No analysis data available</p>
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
