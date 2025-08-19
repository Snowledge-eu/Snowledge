import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSecureApi } from "@/hooks/useSecureApi";
import { Prompt, Community, AnalysisHistory, HistoryFilters } from "./types";

export const useAdminData = () => {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [promptsRes, communitiesRes] = await Promise.all([
        secureQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`),
        secureQuery(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/communities`),
      ]);

      if (promptsRes.ok && promptsRes.data) {
        setPrompts(promptsRes.data);
      }

      if (communitiesRes.ok && communitiesRes.data) {
        setCommunities(communitiesRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    prompts,
    setPrompts,
    communities,
    setCommunities,
    loading,
    fetchData,
  };
};

export const useAnalysisHistory = () => {
  const { fetcher } = useAuth();
  const { secureQuery } = useSecureApi();
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisHistory | null>(null);
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    platform: "all",
    prompt_key: "all",
    community: "all",
    useDateFilter: false,
    date_from: "",
    date_to: "",
    sortOrder: "desc",
  });

  const fetchAnalysisHistory = async (filters = historyFilters) => {
    setHistoryLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.platform !== "all")
        queryParams.append("platform", filters.platform);
      if (filters.prompt_key !== "all")
        queryParams.append("prompt_key", filters.prompt_key);
      if (filters.community !== "all")
        queryParams.append("community", filters.community);
      if (filters.useDateFilter && filters.date_from)
        queryParams.append("date_from", filters.date_from);
      if (filters.useDateFilter && filters.date_to)
        queryParams.append("date_to", filters.date_to);
      if (filters.sortOrder === "asc") queryParams.append("sort_order", "asc");

      const response = await secureQuery(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/analysis-history?${queryParams.toString()}`
      );

      if (response.ok && response.data) {
        setAnalysisHistory(response.data);
      }
    } catch (error) {
      console.error("Error fetching analysis history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  return {
    analysisHistory,
    setAnalysisHistory,
    historyLoading,
    selectedAnalysis,
    setSelectedAnalysis,
    historyFilters,
    setHistoryFilters,
    fetchAnalysisHistory,
  };
};
