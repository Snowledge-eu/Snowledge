import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Avatar, AvatarFallback } from "@repo/ui";
import { TimeframeBadge } from "./timeframe-badge";
import { PlatformAndScopeRow } from "./platform-and-scope-row";

// ============
// Types communs
// ============
export interface AnalysisResultBaseProps {
  result: any;
  title?: string;
  children?: React.ReactNode;
}

// ============
// Function: AnalysisResultBase
// ------------
// DESCRIPTION: Composant de base réutilisable pour les résultats d'analyses (structure commune pure)
// PARAMS: AnalysisResultBaseProps
// RETURNS: JSX.Element
// ============
export function AnalysisResultBase({
  result,
  title,
  children,
}: AnalysisResultBaseProps) {
  if (!result) return null;

  const platform = result?.platform || "discord";
  const scope = result?.scope || "all";

  return (
    <Card className="w-full max-w-5xl mx-auto p-6 md:p-8 shadow-lg border bg-white space-y-6">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          {title || "Analysis"}
        </CardTitle>
        {result?.timeframe && (
          <TimeframeBadge
            timeframe={
              result.timeframe === "2024-06-01 to 2024-06-07"
                ? "last week"
                : result.timeframe
            }
          />
        )}
      </CardHeader>

      <PlatformAndScopeRow
        platform={platform}
        scope={scope}
        label={platform.charAt(0).toUpperCase() + platform.slice(1)}
      />

      <CardContent className="space-y-8">
        {/* Contenu spécifique injecté par les composants enfants */}
        {children}
      </CardContent>
    </Card>
  );
}
