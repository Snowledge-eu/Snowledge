import { Badge } from "@repo/ui/components/badge";
import { Card, CardContent } from "@repo/ui/components/card";
import { History, Loader2 } from "lucide-react";
import { AnalysisHistory } from "../shared/types";
import {
  extractAnalysisInfo,
  formatDate,
  formatDateTime,
} from "../shared/utils";

interface AnalysisHistoryListProps {
  analysisHistory: AnalysisHistory[];
  loading: boolean;
  onSelectAnalysis: (analysis: AnalysisHistory) => void;
}

export const AnalysisHistoryList = ({
  analysisHistory,
  loading,
  onSelectAnalysis,
}: AnalysisHistoryListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (analysisHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No analysis history found</p>
        <p className="text-sm">
          Try adjusting your filters or run some analyses
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {analysisHistory.map((analysis, index) => {
        const analysisInfo = extractAnalysisInfo(analysis);
        return (
          <Card
            key={analysis._id || `analysis-${index}`}
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectAnalysis(analysis)}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{analysisInfo.platform}</Badge>
                  <Badge variant="secondary">{analysisInfo.prompt_key}</Badge>
                  {analysisInfo.llm_model !== "N/A" && (
                    <Badge variant="outline">{analysisInfo.llm_model}</Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(analysisInfo.created_at)}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Analysis ID:</span>
                  <p className="text-muted-foreground font-mono text-xs">
                    {analysisInfo.id}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Creator ID:</span>
                  <p className="text-muted-foreground">
                    {analysisInfo.creator_id}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-muted-foreground">
                    {formatDate(analysisInfo.created_at)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Scope:</span>
                  <p className="text-muted-foreground text-xs">
                    {analysisInfo.scope}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Result:</span>
                  <p className="text-muted-foreground text-xs">
                    {analysisInfo.result_summary}
                  </p>
                </div>
              </div>

              <div className="text-xs text-muted-foreground text-center">
                Click to view details
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
