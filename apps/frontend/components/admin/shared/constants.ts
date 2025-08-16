import {
  AvailableModel,
  PromptRole,
  PromptMode,
  PromptAction,
  PromptOutput,
} from "./types";
import { AVAILABLE_OUTPUTS } from "../../my-community/analysis/generic/utils/fieldDefinitions";

// ============
// MODÈLES DISPONIBLES
// ============
export const AVAILABLE_MODELS: AvailableModel[] = [
  // Mode NLP - Modèles gratuits
  {
    name: "bart-large-cnn",
    cost: "Gratuit",
    description: "Modèle BART optimisé pour la génération de résumés",
    mode: "nlp",
  },
  {
    name: "bert-base-NER",
    cost: "Gratuit",
    description: "Modèle BERT pour la reconnaissance d'entités nommées",
    mode: "nlp",
  },
  {
    name: "bert-base-multilingual-uncased-sentiment",
    cost: "Gratuit",
    description: "Modèle BERT multilingue pour l'analyse de sentiment",
    mode: "nlp",
  },
  {
    name: "roberta-base-go_emotions",
    cost: "Gratuit",
    description: "Modèle RoBERTa pour la classification d'émotions",
    mode: "nlp",
  },
  // Mode Reasoning - Modèles haute performance
  {
    name: "Qwen3-32B",
    cost: "0,23 €/token output",
    description: "Modèle Qwen haute performance pour le raisonnement avancé",
    mode: "reasoning",
  },
  {
    name: "DeepSeek-R1-Distill-Llama-70B",
    cost: "0,67 €/token",
    description: "Modèle DeepSeek haute performance - Raisonnement avancé",
    mode: "reasoning",
  },
  // Mode Standard - Modèles généraux
  {
    name: "Mistral-7B-Instruct-v0.3",
    cost: "0,1 €/Mtoken",
    description: "Modèle Mistral 7B optimisé pour les instructions",
    mode: "standard",
  },
  {
    name: "Llama-3.1-8B-Instruct",
    cost: "0,1 €/Mtoken",
    description: "Modèle Llama 3.1 8B pour le dialogue multilingue",
    mode: "standard",
  },
  {
    name: "Meta-Llama-3_3-70B-Instruct",
    cost: "0,67 €/Mtoken",
    description: "Modèle Llama 3.3 haute performance pour le dialogue",
    mode: "standard",
  },
  {
    name: "Mistral-Nemo-Instruct-2407",
    cost: "0,13 €/Mtoken",
    description: "Modèle Mistral-NVIDIA optimisé multilingue",
    mode: "standard",
  },
  {
    name: "Meta-Llama-3_1-70B-Instruct",
    cost: "0,67 €/Mtoken",
    description: "Modèle Llama 3.1 70B haute performance",
    mode: "standard",
  },
  {
    name: "Mixtral-8x7B-Instruct-v0.1",
    cost: "0,63 €/token",
    description: "Modèle Mixtral Sparse Mixture of Experts",
    mode: "standard",
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
    recommendedModels: [
      "Mistral-7B-Instruct-v0.3",
      "Llama-3.1-8B-Instruct",
      "Mistral-Nemo-Instruct-2407",
      "Meta-Llama-3_1-70B-Instruct",
      "Meta-Llama-3_3-70B-Instruct",
      "Mixtral-8x7B-Instruct-v0.1",
    ],
  },
  {
    id: "nlp",
    name: "NLP Avancé",
    description:
      "Modèles légers focalisés sur des tâches textuelles spécifiques (sentiment, entités, résumé)",
    recommendedModels: [
      "bart-large-cnn",
      "bert-base-NER",
      "bert-base-multilingual-uncased-sentiment",
      "roberta-base-go_emotions",
    ],
  },
  {
    id: "reasoning",
    name: "Raisonnement",
    description: "Analyse avec raisonnement étape par étape et logique avancée",
    recommendedModels: ["Qwen3-32B", "DeepSeek-R1-Distill-Llama-70B"],
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
// OUTPUTS DISPONIBLES (UNIFIÉS)
// ============
// IMPORTANT: AVAILABLE_OUTPUTS est maintenant importé depuis le système unifié
// Cela garantit la cohérence entre la génération de prompts et l'affichage des résultats
export { AVAILABLE_OUTPUTS };
