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

export interface PromptForm {
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
  messages: any[];
  response_format?: any;
  is_public: boolean;
  model_name: string;
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
}
