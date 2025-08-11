export interface Prompt {
  id: number;
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
  messages: any[];
  response_format: any;
  is_public: boolean;
  model_name: string;

  // Nouveaux champs avancés
  role_id?: string;
  mode_id?: string;
  selected_actions?: string[];
  selected_outputs?: string[];
  show_reasoning?: boolean;
  tools_enabled?: boolean;

  created_by: {
    id: number;
    firstname: string;
    lastname: string;
    pseudo: string;
  };
  created_at: string;
}

export interface Community {
  id: number;
  name: string;
  slug: string;
  description: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    pseudo: string;
  };
  discordServer: {
    guildId: string;
    guildName: string;
  } | null;
  created_at: string;
}

export interface AnalysisResult {
  analysis_id: string;
  prompt_used: string;
  community: string;
  message_count: number;
  result: any;
}

export interface AnalysisHistory {
  _id: string;
  creator_id: number;
  platform: string;
  prompt_key: string;
  llm_model?: string;
  scope?: Record<string, any>;
  period?: Record<string, any>;
  result: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HistoryFilters {
  platform: string;
  prompt_key: string;
  community: string;
  useDateFilter: boolean;
  date_from: string;
  date_to: string;
  sortOrder: "asc" | "desc";
}

// ============
// NOUVEAUX TYPES POUR LE SYSTÈME DE PROMPTS AVANCÉ
// ============

export interface PromptRole {
  id: string;
  name: string;
  description: string;
  systemPromptAddition: string;
}

export interface PromptMode {
  id: string;
  name: string;
  description: string;
  recommendedModels: string[];
}

export interface PromptAction {
  id: string;
  name: string;
  description: string;
}

export interface PromptOutput {
  id: string;
  name: string;
  description: string;
  type: "string" | "number" | "array" | "object" | "boolean";
  category:
    | "sentiment"
    | "users"
    | "activity"
    | "topics"
    | "metrics"
    | "moderation"
    | "support"
    | "network"
    | "feedback";
}

export interface PromptForm {
  // Champs de base
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
  messages: any[];
  response_format?: any;
  is_public: boolean;
  model_name: string;

  // Nouveaux champs avancés
  role_id?: string;
  mode_id?: string;
  selected_actions?: string[];
  selected_outputs?: string[];
  show_reasoning?: boolean;
  tools_enabled?: boolean; // Pour plus tard
}

export interface TestForm {
  prompt_name: string;
  community_id: string;
  model_name: string;
}

export interface AvailableModel {
  name: string;
  cost: string;
  description: string;
  mode: "standard" | "nlp" | "reasoning";
}
