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
                      item.auteur ||
                      item.title ||
                      `Item ${index + 1}`}
                </p>

                {/* Messages spéciaux pour les différents types d'objets */}
                {item.message && (
                  <p className="text-xs text-muted-foreground italic mt-1">
                    "{item.message}"
                  </p>
                )}
                {item.nombre_de_messages && (
                  <p className="text-xs text-blue-600 font-medium">
                    {item.nombre_de_messages} messages
                  </p>
                )}
                {item.sentiment && (
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                      item.sentiment === "positif"
                        ? "bg-green-100 text-green-700"
                        : item.sentiment === "négatif"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.sentiment}
                  </span>
                )}

                {/* Propriétés existantes */}
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

                {/* Affichage générique pour les autres propriétés */}
                {Object.entries(item).map(([prop, val]) => {
                  // Skip les propriétés déjà affichées
                  const displayedProps = [
                    "name",
                    "user",
                    "username",
                    "auteur",
                    "title",
                    "message",
                    "nombre_de_messages",
                    "sentiment",
                    "reason",
                    "description",
                    "score",
                    "activity_level",
                  ];
                  if (displayedProps.includes(prop) || typeof val === "object")
                    return null;

                  return (
                    <p key={prop} className="text-xs text-muted-foreground">
                      <span className="font-medium capitalize">
                        {prop.replace(/_/g, " ")}:{" "}
                      </span>
                      {String(val)}
                    </p>
                  );
                })}
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

  // Détecte le type de données et retourne des métadonnées
  const getDataTypeInfo = (value: any, fieldName: string) => {
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

  // Configuration complète basée sur AVAILABLE_OUTPUTS
  const fieldConfig = {
    // Anciens champs (rétrocompatibilité)
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

    // Tous les champs de AVAILABLE_OUTPUTS
    sentiment_global: "Sentiment Level (Global)",
    sentiment_by_channel: "Sentiment Level (Par Canal)",
    sentiment_by_segment: "Sentiment Level (Par Segment)",
    top_influential_users: "Top Influential Users",
    top_active_users: "Top Active Users",
    activity_level: "Activity Level",
    emerging_topics: "Emerging Topics",
    top_topics: "Top Topics",
    user_retention_rate: "User Retention Rate",
    at_risk_users: "At-Risk Users",
    compliance_alerts: "Compliance/Risk Alerts",
    unanswered_questions: "Unanswered Questions",
    top_positive_messages: "Top Positive Messages",
    top_negative_messages: "Top Negative Messages",
    user_interaction_map: "User Interaction Map",
    feedback_clusters: "Feedback Clusters",
    knowledge_base_gaps: "Knowledge Base Gaps",
    reasoning: "Raisonnement du LLM",
  };

  // Extraction des données structurées
  let structuredData = typeof result === "object" ? result : {};

  // Cas spécial : Si les données sont dans userMessages, les extraire
  // FIXME: Les résultats d'analyse ne devraient pas être dans userMessages !
  if (
    structuredData.userMessages &&
    typeof structuredData.userMessages === "object"
  ) {
    console.log(
      "⚠️  GenericResult - ATTENTION: Les résultats d'analyse sont dans userMessages !"
    );
    console.log(
      "🔍 GenericResult - Extracting analysis results from userMessages..."
    );

    // Sauvegarder les vraies userMessages s'il y en a
    const originalUserMessages = Array.isArray(structuredData.userMessages)
      ? structuredData.userMessages
      : null;

    // Extraire les données d'analyse
    structuredData = { ...structuredData, ...structuredData.userMessages };

    // Restaurer les vraies userMessages si c'était un array
    if (originalUserMessages) {
      structuredData.userMessages = originalUserMessages;
    }
  }

  // DEBUG: Afficher le contenu reçu
  console.log("🔍 GenericResult - Raw result:", result);
  console.log("🔍 GenericResult - Structured data:", structuredData);
  console.log(
    "🔍 GenericResult - Available fields:",
    Object.keys(structuredData)
  );

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

  // Fonction pour trier les champs par importance (basée sur AVAILABLE_OUTPUTS)
  const sortFieldsByImportance = (fields: string[]) => {
    console.log("fields", fields);
    const priorityOrder = {
      // Très haute priorité - Résumé et insights principaux
      summary: 1,
      insights: 2,
      explanation: 3,

      // Haute priorité - Métriques globales (category: "metrics")
      confidence: 10,
      score: 11,
      sentiment_global: 12,
      user_retention_rate: 13,
      activity_level: 14,

      // Priorité normale - Sentiment détaillé (category: "sentiment")
      sentiment_by_channel: 20,
      sentiment_by_segment: 21,
      top_positive_messages: 22,
      top_negative_messages: 23,

      // Priorité normale - Utilisateurs (category: "users")
      top_influential_users: 25,
      top_active_users: 26,
      notable_users: 27,
      at_risk_users: 28,

      // Priorité normale - Sujets et tendances (category: "topics")
      emerging_topics: 30,
      top_topics: 31,
      trends: 32,
      keywords: 33,

      // Priorité normale - Contenu et messages
      notable_messages: 35,

      // Priorité basse - Support et modération (category: "support", "moderation")
      unanswered_questions: 40,
      compliance_alerts: 41,

      // Priorité basse - Analyse avancée (category: "network", "feedback")
      user_interaction_map: 45,
      feedback_clusters: 46,
      knowledge_base_gaps: 47,

      // Très basse priorité - Actions et recommandations
      action_points: 50,
      recommendations: 51,

      // Le raisonnement sera traité séparément
      reasoning: 100,
    };

    return fields.sort((a, b) => {
      const priorityA = priorityOrder[a as keyof typeof priorityOrder] || 99;
      const priorityB = priorityOrder[b as keyof typeof priorityOrder] || 99;
      return priorityA - priorityB;
    });
  };

  const allDataFields = Object.keys(structuredData).filter(
    (key) => !systemFields.includes(key)
  );

  console.log("allDataFields", allDataFields);
  const dataFields = sortFieldsByImportance(allDataFields);

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
          .map((key, index) => {
            const value = structuredData[key];
            const title =
              fieldConfig[key as keyof typeof fieldConfig] ||
              key
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

            // Ajouter des séparateurs visuels entre les catégories
            const isNewCategory = (
              currentKey: string,
              previousKey?: string
            ) => {
              if (!previousKey) return false;

              // Mapping basé sur les catégories des AVAILABLE_OUTPUTS
              const categoryMap = {
                // Insights généraux
                summary: "insights",
                insights: "insights",
                explanation: "insights",

                // Métriques (category: "metrics")
                confidence: "metrics",
                score: "metrics",
                user_retention_rate: "metrics",
                activity_level: "activity",

                // Sentiment (category: "sentiment")
                sentiment_global: "sentiment",
                sentiment_by_channel: "sentiment",
                sentiment_by_segment: "sentiment",
                top_positive_messages: "sentiment",
                top_negative_messages: "sentiment",

                // Utilisateurs (category: "users")
                top_influential_users: "users",
                top_active_users: "users",
                notable_users: "users",
                at_risk_users: "users",

                // Sujets (category: "topics")
                emerging_topics: "topics",
                top_topics: "topics",
                trends: "topics",
                keywords: "topics",

                // Messages et contenu
                notable_messages: "content",

                // Support (category: "support")
                unanswered_questions: "support",
                knowledge_base_gaps: "support",

                // Modération (category: "moderation")
                compliance_alerts: "moderation",

                // Analyse avancée (category: "network", "feedback")
                user_interaction_map: "network",
                feedback_clusters: "feedback",

                // Actions
                action_points: "actions",
                recommendations: "actions",
              };

              const currentCategory =
                categoryMap[currentKey as keyof typeof categoryMap] || "other";
              const previousCategory =
                categoryMap[previousKey as keyof typeof categoryMap] || "other";

              return currentCategory !== previousCategory;
            };

            const shouldShowSeparator =
              index > 0 && isNewCategory(key, dataFields[index - 1]);

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
