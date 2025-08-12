import React from "react";

// ============
// Hook pour le formatage du texte libre
// ============

interface TextFormattingReturn {
  formatFreeText: (text: string) => React.ReactElement[];
}

export const useTextFormatting = (): TextFormattingReturn => {
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

  return { formatFreeText };
};
