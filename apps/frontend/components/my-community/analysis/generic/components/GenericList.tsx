import React from "react";
import { AnalysisListBase } from "../../shared/analysis-list-base";
import { GenericListProps } from "../types";

// ============
// Component: GenericList
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
