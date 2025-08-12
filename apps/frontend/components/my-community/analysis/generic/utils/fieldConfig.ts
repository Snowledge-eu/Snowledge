import { FieldConfig, PriorityOrder, CategoryMap } from "../types";

// ============
// Configuration des champs
// ============

export const FIELD_CONFIG: FieldConfig = {
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

// ============
// Ordre de priorité des champs
// ============

export const PRIORITY_ORDER: PriorityOrder = {
  // Très haute priorité - Résumé et insights principaux
  summary: 1,
  insights: 2,
  explanation: 3,

  // Haute priorité - Métriques globales
  confidence: 10,
  score: 11,
  sentiment_global: 12,
  user_retention_rate: 13,
  activity_level: 14,

  // Priorité normale - Sentiment détaillé
  sentiment_by_channel: 20,
  sentiment_by_segment: 21,
  top_positive_messages: 22,
  top_negative_messages: 23,

  // Priorité normale - Utilisateurs
  top_influential_users: 25,
  top_active_users: 26,
  notable_users: 27,
  at_risk_users: 28,

  // Priorité normale - Sujets et tendances
  emerging_topics: 30,
  top_topics: 31,
  trends: 32,
  keywords: 33,

  // Priorité normale - Contenu et messages
  notable_messages: 35,

  // Priorité basse - Support et modération
  unanswered_questions: 40,
  compliance_alerts: 41,

  // Priorité basse - Analyse avancée
  user_interaction_map: 45,
  feedback_clusters: 46,
  knowledge_base_gaps: 47,

  // Très basse priorité - Actions et recommandations
  action_points: 50,
  recommendations: 51,

  // Le raisonnement sera traité séparément
  reasoning: 100,
};

// ============
// Mapping des catégories
// ============

export const CATEGORY_MAP: CategoryMap = {
  // Insights généraux
  summary: "insights",
  insights: "insights",
  explanation: "insights",

  // Métriques
  confidence: "metrics",
  score: "metrics",
  user_retention_rate: "metrics",
  activity_level: "activity",

  // Sentiment
  sentiment_global: "sentiment",
  sentiment_by_channel: "sentiment",
  sentiment_by_segment: "sentiment",
  top_positive_messages: "sentiment",
  top_negative_messages: "sentiment",

  // Utilisateurs
  top_influential_users: "users",
  top_active_users: "users",
  notable_users: "users",
  at_risk_users: "users",

  // Sujets
  emerging_topics: "topics",
  top_topics: "topics",
  trends: "topics",
  keywords: "topics",

  // Messages et contenu
  notable_messages: "content",

  // Support
  unanswered_questions: "support",
  knowledge_base_gaps: "support",

  // Modération
  compliance_alerts: "moderation",

  // Analyse avancée
  user_interaction_map: "network",
  feedback_clusters: "feedback",

  // Actions
  action_points: "actions",
  recommendations: "actions",
};

// ============
// Champs système à exclure
// ============

export const SYSTEM_FIELDS = [
  "platform",
  "scope",
  "timeframe",
  "id",
  "createdAt",
  "updatedAt",
];

// ============
// Champs d'analyse pour vérification
// ============

export const ANALYSIS_FIELDS = [
  "summary",
  "insights",
  "explanation",
  "confidence",
  "score",
  "sentiment_global",
  "top_active_users",
  "compliance_alerts",
  "feedback_clusters",
  "emerging_topics",
  "top_topics",
];

// ============
// Utilitaires
// ============

export const sortFieldsByImportance = (fields: string[]): string[] => {
  return fields.sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a] || 99;
    const priorityB = PRIORITY_ORDER[b] || 99;
    return priorityA - priorityB;
  });
};

export const isNewCategory = (
  currentKey: string,
  previousKey?: string
): boolean => {
  if (!previousKey) return false;

  const currentCategory = CATEGORY_MAP[currentKey] || "other";
  const previousCategory = CATEGORY_MAP[previousKey] || "other";

  return currentCategory !== previousCategory;
};

export const getFieldTitle = (key: string): string => {
  return (
    FIELD_CONFIG[key] ||
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};
