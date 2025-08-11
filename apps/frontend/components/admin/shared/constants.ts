import {
  AvailableModel,
  PromptRole,
  PromptMode,
  PromptAction,
  PromptOutput,
} from "./types";

// ============
// MODÈLES DISPONIBLES
// ============
export const AVAILABLE_MODELS: AvailableModel[] = [
  {
    name: "Llama-3.1-8B-Instruct",
    cost: "0,10 €/token",
    description: "Modèle rapide et économique",
    mode: "standard",
  },
  {
    name: "Mistral-Nemo-Instruct-2407",
    cost: "0,13 €/token",
    description: "Modèle Mistral optimisé",
    mode: "standard",
  },
  {
    name: "Mistral-Small-3.2-24B-Instruct-2506",
    cost: "0,09 €/token input, 0,28 €/token output",
    description: "Modèle Mistral Small haute performance",
    mode: "nlp",
  },
  {
    name: "Meta-Llama-3_1-70B-Instruct",
    cost: "0,67 €/token",
    description: "Modèle Meta haute performance",
    mode: "nlp",
  },
  {
    name: "Meta-Llama-3_3-70B-Instruct",
    cost: "0,67 €/token",
    description: "Modèle Meta haute performance",
    mode: "nlp",
  },
  {
    name: "DeepSeek-R1-Distill-Llama-70B",
    cost: "0,67 €/token",
    description: "Modèle DeepSeek haute performance - Raisonnement avancé",
    mode: "reasoning",
  },
  {
    name: "Mixtral-8x7B-Instruct-v0.1",
    cost: "0,63 €/token",
    description: "Modèle Mixtral haute performance",
    mode: "nlp",
  },
  {
    name: "Qwen3-32B",
    cost: "0,23 €/token output",
    description: "Modèle Qwen haute performance",
    mode: "nlp",
  },
];

// ============
// RÔLES PRÉDÉFINIS
// ============
export const AVAILABLE_ROLES: PromptRole[] = [
  {
    id: "product_manager",
    name: "Chef de Produit",
    description: "Analyse orientée produit, fonctionnalités et roadmap",
    systemPromptAddition:
      "Tu es un chef de produit expérimenté. Concentre-toi sur l'identification des besoins utilisateurs, des opportunités d'amélioration du produit, et des insights stratégiques.",
  },
  {
    id: "community_manager",
    name: "Community Manager",
    description: "Analyse de l'engagement et de la dynamique communautaire",
    systemPromptAddition:
      "Tu es un community manager expert. Focus sur l'engagement, les tendances sociales, l'atmosphère de la communauté et les opportunités d'animation.",
  },
  {
    id: "moderator",
    name: "Modérateur",
    description: "Analyse de modération, risques et conformité",
    systemPromptAddition:
      "Tu es un modérateur expérimenté. Concentre-toi sur la détection de contenus problématiques, les risques de modération, et les alertes de conformité.",
  },
  {
    id: "data_analyst",
    name: "Analyste de Données",
    description: "Analyse quantitative et insights basés sur les données",
    systemPromptAddition:
      "Tu es un analyste de données expert. Focus sur les métriques, les tendances quantitatives, les patterns statistiques et les insights data-driven.",
  },
  {
    id: "customer_success",
    name: "Customer Success",
    description: "Analyse de satisfaction client et rétention",
    systemPromptAddition:
      "Tu es un spécialiste Customer Success. Concentre-toi sur la satisfaction utilisateur, les signaux de churn, et les opportunités d'amélioration de l'expérience.",
  },
  {
    id: "marketing",
    name: "Marketing",
    description: "Analyse marketing, acquisition et conversion",
    systemPromptAddition:
      "Tu es un expert marketing. Focus sur les insights d'acquisition, les messages qui performent, et les opportunités de croissance.",
  },
];

// ============
// MODES D'ANALYSE
// ============
export const AVAILABLE_MODES: PromptMode[] = [
  {
    id: "standard",
    name: "Standard",
    description: "Analyse générale rapide et économique",
    recommendedModels: ["Llama-3.1-8B-Instruct", "Mistral-Nemo-Instruct-2407"],
  },
  {
    id: "nlp",
    name: "NLP Avancé",
    description: "Analyse linguistique et sémantique approfondie",
    recommendedModels: [
      "Meta-Llama-3_1-70B-Instruct",
      "Meta-Llama-3_3-70B-Instruct",
      "Mistral-Small-3.2-24B-Instruct-2506",
    ],
  },
  {
    id: "reasoning",
    name: "Raisonnement",
    description: "Analyse avec raisonnement étape par étape",
    recommendedModels: ["DeepSeek-R1-Distill-Llama-70B"],
  },
];

// ============
// ACTIONS DISPONIBLES
// ============
export const AVAILABLE_ACTIONS: PromptAction[] = [
  {
    id: "sentiment_analysis",
    name: "Analyse de Sentiment",
    description: "Analyser le sentiment global et par segment",
  },
  {
    id: "topic_extraction",
    name: "Extraction de Sujets",
    description: "Identifier les sujets émergents et tendances",
  },
  {
    id: "user_segmentation",
    name: "Segmentation Utilisateurs",
    description: "Identifier les utilisateurs influents et actifs",
  },
  {
    id: "activity_analysis",
    name: "Analyse d'Activité",
    description: "Analyser les patterns d'activité et engagement",
  },
  {
    id: "risk_detection",
    name: "Détection de Risques",
    description: "Identifier les contenus à risque et alertes de conformité",
  },
  {
    id: "knowledge_gaps",
    name: "Détection de Lacunes",
    description:
      "Identifier les questions non répondues et gaps de connaissance",
  },
  {
    id: "interaction_mapping",
    name: "Cartographie d'Interactions",
    description: "Analyser les réseaux d'interactions utilisateurs",
  },
  {
    id: "feedback_clustering",
    name: "Clustering de Feedback",
    description: "Regrouper les retours et idées récurrentes",
  },
];

// ============
// OUTPUTS DISPONIBLES
// ============
export const AVAILABLE_OUTPUTS: PromptOutput[] = [
  {
    id: "sentiment_global",
    name: "Sentiment Level (Global)",
    description: "Sentiment général de la communauté",
    type: "string",
    category: "sentiment",
  },
  {
    id: "sentiment_by_channel",
    name: "Sentiment Level (Par Canal)",
    description: "Sentiment analysé par canal",
    type: "object",
    category: "sentiment",
  },
  {
    id: "sentiment_by_segment",
    name: "Sentiment Level (Par Segment)",
    description: "Sentiment par segment d'utilisateurs",
    type: "object",
    category: "sentiment",
  },
  {
    id: "top_influential_users",
    name: "Top Influential Users",
    description: "Utilisateurs les plus influents",
    type: "array",
    category: "users",
  },
  {
    id: "top_active_users",
    name: "Top Active Users",
    description: "Utilisateurs les plus actifs",
    type: "array",
    category: "users",
  },
  {
    id: "activity_level",
    name: "Activity Level",
    description: "Niveau d'activité (heatmap, évolution)",
    type: "object",
    category: "activity",
  },
  {
    id: "emerging_topics",
    name: "Emerging Topics",
    description: "Sujets émergents et tendances",
    type: "array",
    category: "topics",
  },
  {
    id: "top_topics",
    name: "Top Topics",
    description: "Sujets principaux (fréquence et évolution)",
    type: "array",
    category: "topics",
  },
  {
    id: "user_retention_rate",
    name: "User Retention Rate",
    description: "Taux de rétention utilisateur",
    type: "number",
    category: "metrics",
  },
  {
    id: "at_risk_users",
    name: "At-Risk Users",
    description: "Utilisateurs à risque de churn",
    type: "array",
    category: "users",
  },
  {
    id: "compliance_alerts",
    name: "Compliance/Risk Alerts",
    description: "Alertes de conformité et risques",
    type: "array",
    category: "moderation",
  },
  {
    id: "unanswered_questions",
    name: "Unanswered Questions",
    description: "Questions sans réponse",
    type: "array",
    category: "support",
  },
  {
    id: "top_positive_messages",
    name: "Top Positive Messages",
    description: "Messages les plus positifs",
    type: "array",
    category: "sentiment",
  },
  {
    id: "top_negative_messages",
    name: "Top Negative Messages",
    description: "Messages les plus négatifs",
    type: "array",
    category: "sentiment",
  },
  {
    id: "user_interaction_map",
    name: "User Interaction Map",
    description: "Carte des interactions utilisateurs",
    type: "object",
    category: "network",
  },
  {
    id: "feedback_clusters",
    name: "Feedback Clusters",
    description: "Groupes d'idées récurrentes",
    type: "array",
    category: "feedback",
  },
  {
    id: "knowledge_base_gaps",
    name: "Knowledge Base Gaps",
    description: "Sujets non couverts par la documentation",
    type: "array",
    category: "support",
  },
];
