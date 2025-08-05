import { Button } from "@repo/ui/components/button";
import { X } from "lucide-react";
import { AnalysisHistory } from "../shared/types";
import {
  extractAnalysisInfo,
  formatDateTime,
  getMongoDocData,
} from "../shared/utils";

interface AnalysisDetailsModalProps {
  selectedAnalysis: AnalysisHistory | null;
  onClose: () => void;
}

export const AnalysisDetailsModal = ({
  selectedAnalysis,
  onClose,
}: AnalysisDetailsModalProps) => {
  if (!selectedAnalysis) return null;

  const analysisInfo = extractAnalysisInfo(selectedAnalysis);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Analysis Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="font-medium">Analysis ID:</span>
              <p className="text-sm text-muted-foreground font-mono">
                {analysisInfo.id}
              </p>
            </div>
            <div>
              <span className="font-medium">Creator ID:</span>
              <p className="text-sm text-muted-foreground">
                {analysisInfo.creator_id}
              </p>
            </div>
            <div>
              <span className="font-medium">Platform:</span>
              <p className="text-sm text-muted-foreground">
                {analysisInfo.platform}
              </p>
            </div>
            <div>
              <span className="font-medium">Prompt:</span>
              <p className="text-sm text-muted-foreground">
                {analysisInfo.prompt_key}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">LLM Model:</span>
              <p className="text-sm text-muted-foreground">
                {analysisInfo.llm_model}
              </p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(analysisInfo.created_at)}
              </p>
            </div>
          </div>

          <div>
            <span className="font-medium">Scope:</span>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(
                getMongoDocData(selectedAnalysis, "scope"),
                null,
                2
              )}
            </pre>
          </div>

          <div>
            <span className="font-medium">Result:</span>
            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-x-auto max-h-60">
              {JSON.stringify(
                getMongoDocData(selectedAnalysis, "result"),
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
