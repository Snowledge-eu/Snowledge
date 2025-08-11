"use client";

import { useAuth } from "@/contexts/auth-context";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@repo/ui/components/badge";
import { Loader2, Settings, Users, Play, History } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Alert, AlertDescription } from "@repo/ui/components/alert";

// Import des composants modulaires
import { PromptsSection } from "@/components/admin/prompts/PromptsSection";
import { CommunityList } from "@/components/admin/communities/CommunityList";
import { TestAnalysis } from "@/components/admin/testing/TestAnalysis";
import { AnalysisHistorySection } from "@/components/admin/history/AnalysisHistorySection";

// Import des hooks et types
import { useAdminData } from "@/components/admin/shared/hooks";
import {
  Community,
  AnalysisResult,
  TestForm,
} from "@/components/admin/shared/types";

export default function AdminPage() {
  const { user, fetcher } = useAuth();
  const router = useRouter();
  const { prompts, communities, loading, fetchData } = useAdminData();

  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/");
      return;
    }

    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, router]);

  const handleTestAnalysis = async (formData: TestForm) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/analysis/test-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setAnalysisResult(response.data);
      }
    } catch (error) {
      console.error("Error testing analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert>
          <AlertDescription>
            Access denied. Admin privileges required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary">
          {communities.length} Communities • {prompts.length} Prompts
        </Badge>
      </div>

      <Tabs defaultValue="prompts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Prompts
          </TabsTrigger>
          <TabsTrigger value="communities" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Communities
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Test Analysis
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Analysis History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          <PromptsSection />
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <CommunityList
            communities={communities}
            onSelect={setSelectedCommunity}
          />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <TestAnalysis
            prompts={prompts}
            communities={communities}
            onTestAnalysis={handleTestAnalysis}
            analysisResult={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <AnalysisHistorySection prompts={prompts} communities={communities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
