import { FieldConfig, PriorityOrder, CategoryMap } from "../types";

// ============
// DÉFINITIONS UNIFIÉES DES CHAMPS
// ============
// Ce fichier centralise TOUTES les définitions de champs utilisés dans le système
// Remplacera AVAILABLE_OUTPUTS et FIELD_CONFIG pour une cohérence parfaite

// ===== TYPES DE CHAMPS =====
export type FieldType = "string" | "number" | "array" | "object" | "boolean";
export type FieldCategory =
  | "insights"
  | "metrics"
  | "activity"
  | "sentiment"
  | "users"
  | "topics"
  | "actions"
  | "support"
  | "moderation"
  | "network"
  | "feedback"
  | "content"
  | "analysis";

// ===== DÉFINITION COMPLÈTE DES CHAMPS =====
export interface FieldDefinition {
  id: string;
  name: string;
  description: string;
  type: FieldType;
  category: FieldCategory;
  priority: number;
  displayName: string;
}

// ===== TOUS LES CHAMPS DU SYSTÈME =====
export const ALL_FIELDS: FieldDefinition[] = [
  // ===== INSIGHTS GÉNÉRAUX (Priorité 1-10) =====
  {
    id: "summary",
    name: "Summary",
    description: "Résumé général de l'analyse",
    type: "string",
    category: "insights",
    priority: 1,
    displayName: "Summary",
  },
  {
    id: "insights",
    name: "Insights",
    description: "Insights principaux de l'analyse",
    type: "string",
    category: "insights",
    priority: 2,
    displayName: "Insights",
  },
  {
    id: "explanation",
    name: "Explanation",
    description: "Explication détaillée de l'analyse",
    type: "string",
    category: "insights",
    priority: 3,
    displayName: "Explanation",
  },

  // ===== MÉTRIQUES (Priorité 10-20) =====
  {
    id: "user_retention_rate",
    name: "User Retention Rate",
    description: "Taux de rétention utilisateur",
    type: "number",
    category: "metrics",
    priority: 10,
    displayName: "User Retention Rate",
  },
  {
    id: "activity_level",
    name: "Activity Level",
    description: "Niveau d'activité (heatmap, évolution)",
    type: "object",
    category: "activity",
    priority: 11,
    displayName: "Activity Level",
  },
  {
    id: "confidence",
    name: "Confidence Level",
    description: "Niveau de confiance de l'analyse",
    type: "string",
    category: "metrics",
    priority: 12,
    displayName: "Confidence Level",
  },
  {
    id: "score",
    name: "Confidence Score",
    description: "Score de confiance numérique",
    type: "number",
    category: "metrics",
    priority: 13,
    displayName: "Confidence Score",
  },

  // ===== SENTIMENT (Priorité 15-25) =====
  {
    id: "sentiment_global",
    name: "Sentiment Level (Global)",
    description: "Sentiment général de la communauté",
    type: "string",
    category: "sentiment",
    priority: 15,
    displayName: "Sentiment Level (Global)",
  },
  {
    id: "sentiment",
    name: "Sentiment Analysis",
    description: "Analyse de sentiment générale",
    type: "string",
    category: "sentiment",
    priority: 16,
    displayName: "Sentiment Analysis",
  },
  {
    id: "sentiment_by_channel",
    name: "Sentiment Level (Par Canal)",
    description: "Sentiment analysé par canal",
    type: "object",
    category: "sentiment",
    priority: 17,
    displayName: "Sentiment Level (Par Canal)",
  },
  {
    id: "sentiment_by_segment",
    name: "Sentiment Level (Par Segment)",
    description: "Sentiment par segment d'utilisateurs",
    type: "object",
    category: "sentiment",
    priority: 18,
    displayName: "Sentiment Level (Par Segment)",
  },
  {
    id: "top_positive_messages",
    name: "Top Positive Messages",
    description: "Messages les plus positifs",
    type: "array",
    category: "sentiment",
    priority: 19,
    displayName: "Top Positive Messages",
  },
  {
    id: "top_negative_messages",
    name: "Top Negative Messages",
    description: "Messages les plus négatifs",
    type: "array",
    category: "sentiment",
    priority: 20,
    displayName: "Top Negative Messages",
  },

  // ===== UTILISATEURS (Priorité 25-35) =====
  {
    id: "top_influential_users",
    name: "Top Influential Users",
    description: "Utilisateurs les plus influents",
    type: "array",
    category: "users",
    priority: 25,
    displayName: "Top Influential Users",
  },
  {
    id: "top_active_users",
    name: "Top Active Users",
    description: "Utilisateurs les plus actifs",
    type: "array",
    category: "users",
    priority: 26,
    displayName: "Top Active Users",
  },
  {
    id: "notable_users",
    name: "Notable Users",
    description: "Utilisateurs notables de la communauté",
    type: "array",
    category: "users",
    priority: 27,
    displayName: "Notable Users",
  },
  {
    id: "at_risk_users",
    name: "At-Risk Users",
    description: "Utilisateurs à risque de churn",
    type: "array",
    category: "users",
    priority: 28,
    displayName: "At-Risk Users",
  },

  // ===== SUJETS ET TENDANCES (Priorité 30-40) =====
  {
    id: "emerging_topics",
    name: "Emerging Topics",
    description: "Sujets émergents et tendances",
    type: "array",
    category: "topics",
    priority: 30,
    displayName: "Emerging Topics",
  },
  {
    id: "top_topics",
    name: "Top Topics",
    description: "Sujets principaux (fréquence et évolution)",
    type: "array",
    category: "topics",
    priority: 31,
    displayName: "Top Topics",
  },
  {
    id: "trends",
    name: "Trending Topics",
    description: "Sujets en tendance",
    type: "array",
    category: "topics",
    priority: 32,
    displayName: "Trending Topics",
  },
  {
    id: "topics",
    name: "Topics",
    description: "Sujets généraux",
    type: "array",
    category: "topics",
    priority: 33,
    displayName: "Topics",
  },
  {
    id: "keywords",
    name: "Keywords",
    description: "Mots-clés importants",
    type: "array",
    category: "topics",
    priority: 34,
    displayName: "Keywords",
  },

  // ===== ACTIONS ET RECOMMANDATIONS (Priorité 35-45) =====
  {
    id: "action_points",
    name: "Action Points",
    description: "Points d'action identifiés",
    type: "array",
    category: "actions",
    priority: 35,
    displayName: "Action Points",
  },
  {
    id: "recommendations",
    name: "Recommendations",
    description: "Recommandations d'action",
    type: "array",
    category: "actions",
    priority: 36,
    displayName: "Recommendations",
  },

  // ===== SUPPORT ET MODÉRATION (Priorité 40-50) =====
  {
    id: "compliance_alerts",
    name: "Compliance/Risk Alerts",
    description: "Alertes de conformité et risques",
    type: "array",
    category: "moderation",
    priority: 40,
    displayName: "Compliance/Risk Alerts",
  },
  {
    id: "unanswered_questions",
    name: "Unanswered Questions",
    description: "Questions sans réponse",
    type: "array",
    category: "support",
    priority: 41,
    displayName: "Unanswered Questions",
  },
  {
    id: "knowledge_base_gaps",
    name: "Knowledge Base Gaps",
    description: "Sujets non couverts par la documentation",
    type: "array",
    category: "support",
    priority: 42,
    displayName: "Knowledge Base Gaps",
  },

  // ===== ANALYSE AVANCÉE (Priorité 45-55) =====
  {
    id: "user_interaction_map",
    name: "User Interaction Map",
    description: "Carte des interactions utilisateurs",
    type: "object",
    category: "network",
    priority: 45,
    displayName: "User Interaction Map",
  },
  {
    id: "feedback_clusters",
    name: "Feedback Clusters",
    description: "Groupes d'idées récurrentes",
    type: "array",
    category: "feedback",
    priority: 46,
    displayName: "Feedback Clusters",
  },
  {
    id: "notable_messages",
    name: "Notable Messages",
    description: "Messages notables de la communauté",
    type: "array",
    category: "content",
    priority: 47,
    displayName: "Notable Messages",
  },

  // ===== RAISONNEMENT (Priorité 50+) =====
  {
    id: "reasoning",
    name: "Raisonnement du LLM",
    description: "Raisonnement détaillé de l'IA",
    type: "string",
    category: "analysis",
    priority: 50,
    displayName: "Raisonnement du LLM",
  },
];

// ===== GÉNÉRATION AUTOMATIQUE DES CONFIGURATIONS =====

// Générer FIELD_CONFIG automatiquement
export const FIELD_CONFIG: FieldConfig = ALL_FIELDS.reduce((acc, field) => {
  acc[field.id] = field.displayName;
  return acc;
}, {} as FieldConfig);

// Générer PRIORITY_ORDER automatiquement
export const PRIORITY_ORDER: PriorityOrder = ALL_FIELDS.reduce((acc, field) => {
  acc[field.id] = field.priority;
  return acc;
}, {} as PriorityOrder);

// Générer CATEGORY_MAP automatiquement
export const CATEGORY_MAP: CategoryMap = ALL_FIELDS.reduce((acc, field) => {
  acc[field.id] = field.category;
  return acc;
}, {} as CategoryMap);

// Générer AVAILABLE_OUTPUTS pour compatibilité
export const AVAILABLE_OUTPUTS = ALL_FIELDS.map((field) => ({
  id: field.id,
  name: field.name,
  description: field.description,
  type: field.type,
  category: field.category,
}));

// ===== UTILITAIRES =====

export const getFieldDefinition = (
  fieldId: string
): FieldDefinition | undefined => {
  return ALL_FIELDS.find((field) => field.id === fieldId);
};

export const getFieldsByCategory = (
  category: FieldCategory
): FieldDefinition[] => {
  return ALL_FIELDS.filter((field) => field.category === category);
};

export const getFieldsByType = (type: FieldType): FieldDefinition[] => {
  return ALL_FIELDS.filter((field) => field.type === type);
};

export const sortFieldsByImportance = (fields: string[]): string[] => {
  return fields.sort((a, b) => {
    const fieldA = getFieldDefinition(a);
    const fieldB = getFieldDefinition(b);
    const priorityA = fieldA?.priority || 99;
    const priorityB = fieldB?.priority || 99;
    return priorityA - priorityB;
  });
};

export const isNewCategory = (
  currentKey: string,
  previousKey?: string
): boolean => {
  if (!previousKey) return false;

  const currentField = getFieldDefinition(currentKey);
  const previousField = getFieldDefinition(previousKey);

  const currentCategory = currentField?.category || "other";
  const previousCategory = previousField?.category || "other";

  return currentCategory !== previousCategory;
};

export const getFieldTitle = (key: string): string => {
  const field = getFieldDefinition(key);
  return (
    field?.displayName ||
    key
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

// ===== CHAMPS SYSTÈME À EXCLURE =====
export const SYSTEM_FIELDS = [
  "platform",
  "scope",
  "timeframe",
  "id",
  "_id",
  "createdAt",
  "updatedAt",
];

// ===== TOUS LES CHAMPS D'ANALYSE =====
export const ANALYSIS_FIELDS = ALL_FIELDS.map((field) => field.id);
