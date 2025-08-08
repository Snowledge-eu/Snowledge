import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Avatar, AvatarFallback } from "@repo/ui";
import { TimeframeBadge } from "../timeframe-badge";
import { PlatformAndScopeRow } from "../platform-and-scope-row";

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

        {/* Section Notable Users commune */}
        {result.notable_users && result.notable_users.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold text-lg md:text-xl text-muted-foreground mb-3">
              Notable Users
            </h3>
            <div className="flex flex-wrap justify-start gap-x-8 gap-y-6 mb-2">
              {result.notable_users.map((user: string, idx: number) => (
                <div
                  key={idx}
                  className="flex flex-col items-center"
                  title={user}
                  tabIndex={0}
                  aria-label={user}
                >
                  <Avatar className="size-12">
                    <AvatarFallback>{user[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className="text-xs mt-2 text-foreground max-w-[80px] truncate"
                    title={user}
                  >
                    {user}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
