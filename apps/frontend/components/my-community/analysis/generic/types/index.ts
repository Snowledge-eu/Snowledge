// ============
// Types pour les composants génériques
// ============

export interface GenericResultProps {
  result: any;
}

export interface GenericListProps {
  history: any[];
  onSelect: (result: any) => void;
  promptName?: string;
}

export interface DataTypeInfo {
  type: "url" | "email" | "date" | "score" | "long_text" | "simple";
  icon: string;
  color: string;
  textColor: string;
}

export interface FieldConfig {
  [key: string]: string;
}

export interface PriorityOrder {
  [key: string]: number;
}

export interface CategoryMap {
  [key: string]: string;
}
