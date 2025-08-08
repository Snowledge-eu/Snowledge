import { CheckCircle2 } from "lucide-react";
import { AnalysisResultBase } from "./shared/analysis-result-base";

// ============
// Function: SummaryResultBase
// ------------
// DESCRIPTION: Composant spécialisé pour les résultats de summaries
// PARAMS: result: object avec summary et action_points
// RETURNS: JSX.Element
// ============
export function SummaryResultBase({ result }: { result: any }) {
  if (!result) return null;

  return (
    <AnalysisResultBase result={result} title="Summary Analysis">
      <div>
        <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">
          Summary
        </h3>
        <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
          {result.summary}
        </p>
      </div>
      <div>
        <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">
          Action Points
        </h3>
        <ul className="list-disc list-inside space-y-3">
          {result.action_points?.map((point: string, idx: number) => (
            <li
              key={idx}
              className="text-base md:text-lg flex items-start gap-3 font-medium"
            >
              <CheckCircle2 size={20} className="text-primary mt-0.5" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </AnalysisResultBase>
  );
}
