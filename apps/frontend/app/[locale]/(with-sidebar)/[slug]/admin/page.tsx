"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Textarea } from "@repo/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Switch } from "@repo/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Badge } from "@repo/ui/components/badge";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Play,
  Settings,
  Users,
  MessageSquare,
  History,
  Filter,
  Calendar,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";

// Liste des modèles disponibles avec leurs coûts
const AVAILABLE_MODELS = [
  {
    name: "Llama-3.1-8B-Instruct",
    cost: "0,10 €/token",
    description: "Modèle rapide et économique",
  },
  {
    name: "Mistral-Nemo-Instruct-2407",
    cost: "0,13 €/token",
    description: "Modèle Mistral optimisé",
  },
  {
    name: "Mistral-Small-3.2-24B-Instruct-2506",
    cost: "0,09 €/token input, 0,28 €/token output",
    description: "Modèle Mistral Small haute performance",
  },
  {
    name: "Meta-Llama-3_1-70B-Instruct",
    cost: "0,67 €/token",
    description: "Modèle Meta haute performance",
  },
  {
    name: "Meta-Llama-3_3-70B-Instruct",
    cost: "0,67 €/token",
    description: "Modèle Meta haute performance",
  },
  {
    name: "DeepSeek-R1-Distill-Llama-70B",
    cost: "0,67 €/token",
    description: "Modèle DeepSeek haute performance",
  },
  {
    name: "Mixtral-8x7B-Instruct-v0.1",
    cost: "0,63 €/token",
    description: "Modèle Mixtral haute performance",
  },
  {
    name: "Qwen3-32B",
    cost: "0,23 €/token output",
    description: "Modèle Qwen haute performance",
  },
];

interface Prompt {
  id: number;
  name: string;
  description: string;
  platform: string;
  temperature: number;
  top_p: number;
  messages: any[];
  response_format: any;
  is_public: boolean;
  model_name: string;
  created_by: {
    id: number;
    firstname: string;
    lastname: string;
    pseudo: string;
  };
  created_at: string;
}

interface Community {
  id: number;
  name: string;
  slug: string;
  description: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    pseudo: string;
  };
  discordServer: {
    guildId: string;
    guildName: string;
  } | null;
  created_at: string;
}

interface AnalysisResult {
  analysis_id: string;
  prompt_used: string;
  community: string;
  message_count: number;
  result: any;
}

interface AnalysisHistory {
  _id: string;
  creator_id: number;
  platform: string;
  prompt_key: string;
  llm_model?: string;
  scope?: Record<string, any>;
  period?: Record<string, any>;
  result: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export default function AdminPage() {
  const { user, fetcher } = useAuth();
  const router = useRouter();
  const t = useTranslations("admin");

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // History states
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisHistory | null>(null);
  const [historyFilters, setHistoryFilters] = useState({
    platform: "all",
    prompt_key: "all",
    community: "all",
    useDateFilter: false,
    date_from: "",
    date_to: "",
    sortOrder: "desc" as "asc" | "desc", // "desc" = plus récent en premier, "asc" = plus ancien en premier
  });

  // Form states
  const [promptForm, setPromptForm] = useState({
    name: "",
    description: "",
    platform: "discord",
    temperature: 0.3,
    top_p: 0.8,
    messages: [
      { role: "system", content: "" },
      { role: "user", content: "{{messages}}" },
    ],
    response_format: { type: "json_schema", json_schema: {} },
    is_public: false,
    model_name: "Llama-3.1-8B-Instruct",
  });

  const [testForm, setTestForm] = useState({
    prompt_name: "",
    community_id: "",
    model_name: "default",
  });

  const [responseFormatText, setResponseFormatText] = useState("");

  // Utility function to safely format dates
  const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString: string | Date | undefined): string => {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Function to extract important info from MongoDB document
  const extractAnalysisInfo = (analysis: any) => {
    // Handle MongoDB document structure
    const doc = analysis._doc || analysis;

    // Extract ID properly
    let analysisId = "N/A";
    if (doc._id) {
      if (typeof doc._id === "string") {
        analysisId = doc._id;
      } else if (doc._id.buffer) {
        // Convert Buffer to string
        analysisId = Buffer.from(doc._id.buffer.data).toString("hex");
      } else if (doc._id.toString) {
        analysisId = doc._id.toString();
      }
    }

    // Extract scope info
    let scopeInfo = "N/A";
    if (doc.scope) {
      if (doc.scope.server_id && doc.scope.channel_id) {
        const serverId = doc.scope.server_id.low || doc.scope.server_id;
        const channelId = doc.scope.channel_id.low || doc.scope.channel_id;
        scopeInfo = `Server: ${serverId}, Channel: ${channelId}`;
      }
    }

    // Extract period info
    let periodInfo = "N/A";
    if (doc.period) {
      const from = formatDate(doc.period.from);
      const to = formatDate(doc.period.to);
      periodInfo = `${from} → ${to}`;
    }

    // Extract result summary
    let resultSummary = "N/A";
    if (doc.result && doc.result.choices && doc.result.choices[0]) {
      try {
        const content = doc.result.choices[0].message.content;
        const parsed = JSON.parse(content);
        if (parsed.trends && parsed.trends[0]) {
          resultSummary = parsed.trends[0].title || "Analysis completed";
        } else {
          resultSummary = "Analysis completed";
        }
      } catch (error) {
        resultSummary = "Analysis completed";
      }
    }

    return {
      id: analysisId,
      creator_id: doc.creator_id || "N/A",
      platform: doc.platform || "N/A",
      prompt_key: doc.prompt_key || "N/A",
      llm_model: doc.llm_model || "N/A",
      scope: scopeInfo,
      period: periodInfo,
      result_summary: resultSummary,
      created_at: doc.created_at || analysis.created_at,
      updated_at: doc.updated_at || analysis.updated_at,
      full_data: analysis, // Keep full data for detailed view
    };
  };

  // Function to safely get MongoDB document data
  const getMongoDocData = (analysis: any, field: string) => {
    const doc = (analysis as any)._doc || analysis;
    return doc[field] || analysis[field];
  };

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/");
      return;
    }

    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, router]);

  // Auto-load analysis history when data is available
  useEffect(() => {
    if (user?.isAdmin && prompts.length > 0 && communities.length > 0) {
      fetchAnalysisHistory();
    }
  }, [user, prompts.length, communities.length]);

  const fetchData = async () => {
    try {
      const [promptsRes, communitiesRes] = await Promise.all([
        fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`),
        fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/communities`),
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

      const response = await fetcher(
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

  const handleCreatePrompt = async () => {
    try {
      // Parser le response_format si il y en a un
      let finalPromptForm: any = { ...promptForm };

      if (responseFormatText.trim()) {
        try {
          const parsedResponseFormat = JSON.parse(responseFormatText);
          finalPromptForm.response_format = parsedResponseFormat;
        } catch (error) {
          console.error("Invalid response format JSON:", error);
          // Continuer sans response_format si le JSON est invalide
          const { response_format, ...formWithoutResponseFormat } =
            finalPromptForm;
          finalPromptForm = formWithoutResponseFormat;
        }
      } else {
        // Si le champ est vide, ne pas inclure response_format
        const { response_format, ...formWithoutResponseFormat } =
          finalPromptForm;
        finalPromptForm = formWithoutResponseFormat;
      }

      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPromptForm),
        }
      );

      if (response.ok && response.data) {
        const newPrompt = response.data;
        setPrompts([newPrompt, ...prompts]);
        setIsCreatingPrompt(false);
        resetPromptForm();
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      // Parser le response_format si il y en a un
      let finalPromptForm: any = { ...promptForm };

      if (responseFormatText.trim()) {
        try {
          const parsedResponseFormat = JSON.parse(responseFormatText);
          finalPromptForm.response_format = parsedResponseFormat;
        } catch (error) {
          console.error("Invalid response format JSON:", error);
          // Continuer sans response_format si le JSON est invalide
          const { response_format, ...formWithoutResponseFormat } =
            finalPromptForm;
          finalPromptForm = formWithoutResponseFormat;
        }
      } else {
        // Si le champ est vide, ne pas inclure response_format
        const { response_format, ...formWithoutResponseFormat } =
          finalPromptForm;
        finalPromptForm = formWithoutResponseFormat;
      }

      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/${selectedPrompt.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(finalPromptForm),
        }
      );

      if (response.ok && response.data) {
        const updatedPrompt = response.data;
        setPrompts(
          prompts.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p))
        );
        setIsEditingPrompt(false);
        setSelectedPrompt(null);
        resetPromptForm();
      }
    } catch (error) {
      console.error("Error updating prompt:", error);
    }
  };

  const handleDeletePrompt = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setPrompts(prompts.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting prompt:", error);
    }
  };

  const handleTestAnalysis = async () => {
    if (!selectedPrompt || !selectedCommunity) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const requestBody = {
        ...testForm,
        prompt_name: selectedPrompt.name,
        community_id: selectedCommunity.id.toString(),
      };

      // Ne pas inclure model_name si c'est "default"
      if (testForm.model_name !== "default") {
        requestBody.model_name = testForm.model_name;
      }

      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/test-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (response.ok && response.data) {
        const result = response.data;
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error("Error testing analysis:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetPromptForm = () => {
    setPromptForm({
      name: "",
      description: "",
      platform: "discord",
      temperature: 0.3,
      top_p: 0.8,
      messages: [
        {
          role: "system",
          content: "",
        },
        { role: "user", content: "{{messages}}" },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {},
      },
      is_public: false,
      model_name: "Llama-3.1-8B-Instruct",
    });

    setResponseFormatText(
      JSON.stringify(
        {
          type: "json_schema",
          json_schema: {},
        },
        null,
        2
      )
    );
  };

  const editPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setPromptForm({
      name: prompt.name,
      description: prompt.description,
      platform: prompt.platform,
      temperature: prompt.temperature,
      top_p: prompt.top_p,
      messages: prompt.messages,
      response_format: prompt.response_format,
      is_public: prompt.is_public,
      model_name: prompt.model_name,
    });
    setResponseFormatText(JSON.stringify(prompt.response_format, null, 2));
    setIsEditingPrompt(true);

    // Scroll vers le formulaire après un court délai
    setTimeout(() => {
      const formElement = document.getElementById("edit-prompt-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prompt Management</CardTitle>
                <Button
                  onClick={() => {
                    setIsCreatingPrompt(true);
                    resetPromptForm();
                    // Scroll vers le formulaire après un court délai
                    setTimeout(() => {
                      const formElement =
                        document.getElementById("edit-prompt-form");
                      if (formElement) {
                        formElement.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }, 100);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Prompt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {prompts.map((prompt) => (
                  <Card key={prompt.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{prompt.name}</h3>
                          <Badge
                            variant={prompt.is_public ? "default" : "secondary"}
                          >
                            {prompt.is_public ? "Public" : "Private"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {prompt.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Platform: {prompt.platform}</span>
                          <span>Temperature: {prompt.temperature}</span>
                          <span>Top P: {prompt.top_p}</span>
                          <span>Model: {prompt.model_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editPrompt(prompt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePrompt(prompt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {(isCreatingPrompt || isEditingPrompt) && (
            <Card
              id="edit-prompt-form"
              className="border-2 border-primary/20 bg-primary/5"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isCreatingPrompt ? "➕ Create New Prompt" : "✏️ Edit Prompt"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={promptForm.name}
                      onChange={(e) =>
                        setPromptForm({ ...promptForm, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Select
                      value={promptForm.platform}
                      onValueChange={(value) =>
                        setPromptForm({ ...promptForm, platform: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model_name">Model</Label>
                    <Select
                      value={promptForm.model_name}
                      onValueChange={(value) =>
                        setPromptForm({ ...promptForm, model_name: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_MODELS.map((model) => (
                          <SelectItem key={model.name} value={model.name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {model.cost} - {model.description}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={promptForm.temperature}
                      onChange={(e) =>
                        setPromptForm({
                          ...promptForm,
                          temperature: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="top_p">Top P</Label>
                    <Input
                      id="top_p"
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={promptForm.top_p}
                      onChange={(e) =>
                        setPromptForm({
                          ...promptForm,
                          top_p: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={promptForm.description}
                      onChange={(e) =>
                        setPromptForm({
                          ...promptForm,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="system-content">System Message</Label>
                  <Textarea
                    id="system-content"
                    value={promptForm.messages[0]?.content || ""}
                    onChange={(e) => {
                      const newMessages = [...promptForm.messages];
                      newMessages[0] = {
                        ...newMessages[0],
                        content: e.target.value,
                      };
                      setPromptForm({ ...promptForm, messages: newMessages });
                    }}
                    placeholder="Enter the system message that will frame the analysis..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="response-format">
                    Response Format (JSON Schema)
                  </Label>
                  <Textarea
                    id="response-format"
                    value={responseFormatText}
                    onChange={(e) => {
                      const value = e.target.value;
                      setResponseFormatText(value);
                      try {
                        const responseFormat = JSON.parse(value);
                        setPromptForm({
                          ...promptForm,
                          response_format: responseFormat,
                        });
                      } catch (error) {
                        // Garder la valeur même si le JSON n'est pas valide pendant la saisie
                        // Ne pas mettre à jour le state pour éviter les erreurs
                      }
                    }}
                    placeholder='{"type": "json_schema", "json_schema": {...}}'
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Définit la structure de la réponse JSON. Laissez vide pour
                    une réponse libre.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_public"
                    checked={promptForm.is_public}
                    onCheckedChange={(checked) =>
                      setPromptForm({ ...promptForm, is_public: checked })
                    }
                  />
                  <Label htmlFor="is_public">Make this prompt public</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={
                      isCreatingPrompt ? handleCreatePrompt : handleUpdatePrompt
                    }
                    className="flex-1"
                  >
                    {isCreatingPrompt ? "Create Prompt" : "Update Prompt"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreatingPrompt(false);
                      setIsEditingPrompt(false);
                      setSelectedPrompt(null);
                      resetPromptForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="communities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {communities.map((community) => (
                  <Card key={community.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <h3 className="font-semibold">{community.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {community.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Created by: {community.user.pseudo}</span>
                          {community.discordServer && (
                            <span>
                              Discord: {community.discordServer.guildName}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCommunity(community)}
                      >
                        Select
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Prompt</Label>
                  <Select
                    value={selectedPrompt?.name || ""}
                    onValueChange={(value) => {
                      const prompt = prompts.find((p) => p.name === value);
                      setSelectedPrompt(prompt || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      {prompts.map((prompt) => (
                        <SelectItem key={prompt.id} value={prompt.name}>
                          {prompt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Community</Label>
                  <Select
                    value={selectedCommunity?.id.toString() || ""}
                    onValueChange={(value) => {
                      const community = communities.find(
                        (c) => c.id.toString() === value
                      );
                      setSelectedCommunity(community || null);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a community" />
                    </SelectTrigger>
                    <SelectContent>
                      {communities.map((community) => (
                        <SelectItem
                          key={community.id}
                          value={community.id.toString()}
                        >
                          {community.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model_name">Model</Label>
                  <Select
                    value={testForm.model_name}
                    onValueChange={(value) =>
                      setTestForm({ ...testForm, model_name: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a model (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">
                        Use prompt's default model
                      </SelectItem>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                          <div className="flex flex-col">
                            <span className="font-medium">{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.cost} - {model.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleTestAnalysis}
                disabled={!selectedPrompt || !selectedCommunity || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isAnalyzing ? "Analyzing..." : "Run Analysis Test"}
              </Button>

              {isAnalyzing && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analysis in Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Analyzing {selectedCommunity?.name} with{" "}
                      {selectedPrompt?.name}... This may take a few moments.
                    </p>
                  </CardContent>
                </Card>
              )}

              {analysisResult && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Prompt:</strong> {analysisResult.prompt_used}
                        </div>
                        <div>
                          <strong>Community:</strong> {analysisResult.community}
                        </div>
                        <div>
                          <strong>Messages analyzed:</strong>{" "}
                          {analysisResult.message_count}
                        </div>
                        <div>
                          <strong>Analysis ID:</strong>{" "}
                          {analysisResult.analysis_id}
                        </div>
                        <div>
                          <strong>Model used:</strong>{" "}
                          {testForm.model_name === "default" ||
                          !testForm.model_name
                            ? selectedPrompt?.model_name ||
                              "Llama-3.1-8B-Instruct"
                            : testForm.model_name}
                          {(testForm.model_name === "default" ||
                            !testForm.model_name) &&
                            selectedPrompt && (
                              <span className="text-muted-foreground ml-2">
                                (prompt's default)
                              </span>
                            )}
                        </div>
                      </div>

                      {analysisResult.result && (
                        <div className="space-y-4">
                          <div className="p-4 bg-muted rounded">
                            <h4 className="font-semibold mb-2">
                              Analysis Summary
                            </h4>
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Message Count:</strong>{" "}
                                {analysisResult.result.message_count}
                              </p>
                              <p>
                                <strong>Test Analysis:</strong>{" "}
                                {analysisResult.result.test_analysis
                                  ? "Yes"
                                  : "No"}
                              </p>
                            </div>
                          </div>

                          {analysisResult.result.analysis_result && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                AI Analysis Result
                              </h4>
                              <div className="p-4 bg-muted rounded">
                                <pre className="text-sm whitespace-pre-wrap">
                                  {typeof analysisResult.result
                                    .analysis_result === "string"
                                    ? analysisResult.result.analysis_result
                                    : JSON.stringify(
                                        analysisResult.result.analysis_result,
                                        null,
                                        2
                                      )}
                                </pre>
                              </div>
                            </div>
                          )}

                          {analysisResult.result.formatted_messages && (
                            <div className="space-y-2">
                              <h4 className="font-semibold">
                                Sample Messages (First 10)
                              </h4>
                              <div className="max-h-60 overflow-y-auto p-4 bg-muted rounded text-sm">
                                {analysisResult.result.formatted_messages
                                  .split("\n")
                                  .slice(0, 10)
                                  .map((message: string, index: number) => (
                                    <div
                                      key={index}
                                      className="mb-2 p-2 bg-background rounded"
                                    >
                                      <div className="text-xs text-muted-foreground mb-1">
                                        {message
                                          .split("] ")[0]
                                          ?.replace("[", "")}
                                      </div>
                                      <div className="text-sm">
                                        {message.split("] ")[1] || message}
                                      </div>
                                    </div>
                                  ))}
                                {analysisResult.result.formatted_messages.split(
                                  "\n"
                                ).length > 10 && (
                                  <div className="text-xs text-muted-foreground mt-2">
                                    ... and{" "}
                                    {analysisResult.result.formatted_messages.split(
                                      "\n"
                                    ).length - 10}{" "}
                                    more messages
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
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
              {/* Filters */}
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters & Sort
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-filter">Platform</Label>
                    <Select
                      value={historyFilters.platform}
                      onValueChange={(value) =>
                        setHistoryFilters({
                          ...historyFilters,
                          platform: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="discord">Discord</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt-filter">Prompt</Label>
                    <Select
                      value={historyFilters.prompt_key}
                      onValueChange={(value) =>
                        setHistoryFilters({
                          ...historyFilters,
                          prompt_key: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prompts</SelectItem>
                        {prompts.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.name}>
                            {prompt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="community-filter">Community</Label>
                    <Select
                      value={historyFilters.community}
                      onValueChange={(value) =>
                        setHistoryFilters({
                          ...historyFilters,
                          community: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Communities</SelectItem>
                        {communities.map((community) => (
                          <SelectItem key={community.id} value={community.name}>
                            {community.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Select
                      value={historyFilters.sortOrder}
                      onValueChange={(value: "asc" | "desc") =>
                        setHistoryFilters({
                          ...historyFilters,
                          sortOrder: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-date-filter"
                        checked={historyFilters.useDateFilter}
                        onCheckedChange={(checked) =>
                          setHistoryFilters({
                            ...historyFilters,
                            useDateFilter: checked,
                          })
                        }
                      />
                      <Label htmlFor="use-date-filter">Filter by Date</Label>
                    </div>
                  </div>
                </div>

                {/* Date Filters - Only show if useDateFilter is true */}
                {historyFilters.useDateFilter && (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="date-from">From Date</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={historyFilters.date_from}
                        onChange={(e) =>
                          setHistoryFilters({
                            ...historyFilters,
                            date_from: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date-to">To Date</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={historyFilters.date_to}
                        onChange={(e) =>
                          setHistoryFilters({
                            ...historyFilters,
                            date_to: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => fetchAnalysisHistory()}
                    disabled={historyLoading}
                  >
                    {historyLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Filter className="h-4 w-4 mr-2" />
                    )}
                    Apply Filters
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setHistoryFilters({
                        platform: "all",
                        prompt_key: "all",
                        community: "all",
                        useDateFilter: false,
                        date_from: "",
                        date_to: "",
                        sortOrder: "desc",
                      });
                      fetchAnalysisHistory({
                        platform: "all",
                        prompt_key: "all",
                        community: "all",
                        useDateFilter: false,
                        date_from: "",
                        date_to: "",
                        sortOrder: "desc",
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* History List */}
              <div className="space-y-4">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : analysisHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No analysis history found</p>
                    <p className="text-sm">
                      Try adjusting your filters or run some analyses
                    </p>
                  </div>
                ) : (
                  analysisHistory.map((analysis, index) => {
                    const analysisInfo = extractAnalysisInfo(analysis);
                    return (
                      <Card
                        key={analysis._id || `analysis-${index}`}
                        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {analysisInfo.platform}
                              </Badge>
                              <Badge variant="secondary">
                                {analysisInfo.prompt_key}
                              </Badge>
                              {analysisInfo.llm_model !== "N/A" && (
                                <Badge variant="outline">
                                  {analysisInfo.llm_model}
                                </Badge>
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
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Analysis Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAnalysis(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Analysis ID:</span>
                  <p className="text-sm text-muted-foreground font-mono">
                    {extractAnalysisInfo(selectedAnalysis).id}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Creator ID:</span>
                  <p className="text-sm text-muted-foreground">
                    {extractAnalysisInfo(selectedAnalysis).creator_id}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Platform:</span>
                  <p className="text-sm text-muted-foreground">
                    {extractAnalysisInfo(selectedAnalysis).platform}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Prompt:</span>
                  <p className="text-sm text-muted-foreground">
                    {extractAnalysisInfo(selectedAnalysis).prompt_key}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">LLM Model:</span>
                  <p className="text-sm text-muted-foreground">
                    {extractAnalysisInfo(selectedAnalysis).llm_model}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(
                      extractAnalysisInfo(selectedAnalysis).created_at
                    )}
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
      )}
    </div>
  );
}
