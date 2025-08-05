import { useEffect } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Filter, History, Loader2 } from "lucide-react";
import { AnalysisHistoryFilters } from "./AnalysisHistoryFilters";
import { AnalysisHistoryList } from "./AnalysisHistoryList";
import { AnalysisDetailsModal } from "./AnalysisDetailsModal";
import { useAnalysisHistory } from "../shared/hooks";
import { Prompt, Community } from "../shared/types";

interface AnalysisHistorySectionProps {
  prompts: Prompt[];
  communities: Community[];
}

export const AnalysisHistorySection = ({
  prompts,
  communities,
}: AnalysisHistorySectionProps) => {
  const {
    analysisHistory,
    historyLoading,
    selectedAnalysis,
    setSelectedAnalysis,
    historyFilters,
    setHistoryFilters,
    fetchAnalysisHistory,
  } = useAnalysisHistory();

  useEffect(() => {
    if (prompts.length > 0 && communities.length > 0) {
      fetchAnalysisHistory();
    }
  }, [prompts.length, communities.length]);

  const handleFiltersChange = (newFilters: typeof historyFilters) => {
    setHistoryFilters(newFilters);
  };

  const handleApplyFilters = () => {
    fetchAnalysisHistory();
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      platform: "all",
      prompt_key: "all",
      community: "all",
      useDateFilter: false,
      date_from: "",
      date_to: "",
      sortOrder: "desc" as const,
    };
    setHistoryFilters(defaultFilters);
    fetchAnalysisHistory(defaultFilters);
  };

  const handleSelectAnalysis = (analysis: any) => {
    setSelectedAnalysis(analysis);
  };

  const handleCloseModal = () => {
    setSelectedAnalysis(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Analysis History
            </CardTitle>
            <Button
              onClick={() => fetchAnalysisHistory()}
              disabled={historyLoading}
            >
              {historyLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Filter className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <AnalysisHistoryFilters
            prompts={prompts}
            communities={communities}
            filters={historyFilters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            loading={historyLoading}
          />

          <AnalysisHistoryList
            analysisHistory={analysisHistory}
            loading={historyLoading}
            onSelectAnalysis={handleSelectAnalysis}
          />
        </CardContent>
      </Card>

      <AnalysisDetailsModal
        selectedAnalysis={selectedAnalysis}
        onClose={handleCloseModal}
      />
    </div>
  );
};
