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
    name: "Mistral-Small-3.2-24B-Instruct-2506",
    cost: "0,09 €/token (input) - 0,28 €/token (output)",
    description: "Bon rapport qualité/prix",
  },
  {
    name: "Mistral-Nemo-Instruct-2407",
    cost: "0,13 €/token",
    description: "Modèle Mistral optimisé",
  },
  {
    name: "Qwen3-32B",
    cost: "0,23 €/token (output)",
    description: "Modèle Alibaba performant",
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
    model_name: "llama3.1-8b-instruct",
  });

  const [testForm, setTestForm] = useState({
    prompt_name: "",
    community_id: "",
    model_name: "default",
    max_tokens: 2000,
  });

  useEffect(() => {
    if (user && !user.isAdmin) {
      router.push("/");
      return;
    }

    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, router]);

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

  const handleCreatePrompt = async () => {
    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promptForm),
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
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/${selectedPrompt.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promptForm),
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

    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/test-analysis`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...testForm,
            prompt_name: selectedPrompt.name,
            community_id: selectedCommunity.id.toString(),
            model_name:
              testForm.model_name === "default"
                ? undefined
                : testForm.model_name, // Envoyer undefined si "default" pour utiliser le modèle du prompt
          }),
        }
      );

      if (response.ok && response.data) {
        const result = response.data;
        setAnalysisResult(result);
      }
    } catch (error) {
      console.error("Error testing analysis:", error);
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
        { role: "system", content: "" },
        { role: "user", content: "{{messages}}" },
      ],
      response_format: { type: "json_schema", json_schema: {} },
      is_public: false,
      model_name: "llama3.1-8b-instruct",
    });
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
    setIsEditingPrompt(true);
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
        <TabsList className="grid w-full grid-cols-3">
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
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Prompt Management</CardTitle>
                <Button onClick={() => setIsCreatingPrompt(true)}>
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
            <Card>
              <CardHeader>
                <CardTitle>
                  {isCreatingPrompt ? "Create New Prompt" : "Edit Prompt"}
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
                <div className="space-y-2">
                  <Label htmlFor="max_tokens">Max Tokens</Label>
                  <Input
                    id="max_tokens"
                    type="number"
                    value={testForm.max_tokens}
                    onChange={(e) =>
                      setTestForm({
                        ...testForm,
                        max_tokens: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleTestAnalysis}
                disabled={!selectedPrompt || !selectedCommunity}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Run Analysis Test
              </Button>

              {analysisResult && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Analysis Result</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Prompt:</strong> {analysisResult.prompt_used}
                      </p>
                      <p>
                        <strong>Community:</strong> {analysisResult.community}
                      </p>
                      <p>
                        <strong>Messages analyzed:</strong>{" "}
                        {analysisResult.message_count}
                      </p>
                      <p>
                        <strong>Analysis ID:</strong>{" "}
                        {analysisResult.analysis_id}
                      </p>
                      <p>
                        <strong>Model used:</strong>{" "}
                        {testForm.model_name === "default" ||
                        !testForm.model_name
                          ? selectedPrompt?.model_name || "llama3.1-8b-instruct"
                          : testForm.model_name}
                        {(testForm.model_name === "default" ||
                          !testForm.model_name) &&
                          selectedPrompt && (
                            <span className="text-muted-foreground ml-2">
                              (prompt's default)
                            </span>
                          )}
                      </p>
                    </div>
                    {analysisResult.result && (
                      <div className="mt-4 p-4 bg-muted rounded">
                        <pre className="text-sm overflow-auto">
                          {JSON.stringify(analysisResult.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
