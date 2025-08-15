import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Loader2, Play } from "lucide-react";
import { Prompt, Community, AnalysisResult, TestForm } from "./shared/types";
import { AVAILABLE_MODELS } from "./shared/constants";

interface TestAnalysisProps {
  prompts: Prompt[];
  communities: Community[];
  onTestAnalysis: (formData: TestForm) => Promise<void>;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
}

export const TestAnalysis = ({
  prompts,
  communities,
  onTestAnalysis,
  analysisResult,
  isAnalyzing,
}: TestAnalysisProps) => {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );
  const [testForm, setTestForm] = useState<TestForm>({
    prompt_name: "",
    community_id: "",
    model_name: "default",
  });

  const handleTestAnalysis = async () => {
    if (!selectedPrompt || !selectedCommunity) return;

    const requestBody = {
      ...testForm,
      prompt_name: selectedPrompt.name,
      community_id: selectedCommunity.id.toString(),
    };

    if (testForm.model_name !== "default") {
      requestBody.model_name = testForm.model_name;
    }

    await onTestAnalysis(requestBody);
  };

  return (
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
                Analyzing {selectedCommunity?.name} with {selectedPrompt?.name}
                ... This may take a few moments.
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
                    <strong>Analysis ID:</strong> {analysisResult.analysis_id}
                  </div>
                  <div>
                    <strong>Model used:</strong>{" "}
                    {testForm.model_name === "default" || !testForm.model_name
                      ? selectedPrompt?.model_name || "Llama-3.1-8B-Instruct"
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
                      <h4 className="font-semibold mb-2">Analysis Summary</h4>
                      <div className="text-sm space-y-1">
                        <p>
                          <strong>Message Count:</strong>{" "}
                          {analysisResult.result.message_count}
                        </p>
                        <p>
                          <strong>Test Analysis:</strong>{" "}
                          {analysisResult.result.test_analysis ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {analysisResult.result.analysis_result && (
                      <div className="space-y-2">
                        <h4 className="font-semibold">AI Analysis Result</h4>
                        <div className="p-4 bg-muted rounded">
                          <pre className="text-sm whitespace-pre-wrap">
                            {typeof analysisResult.result.analysis_result ===
                            "string"
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
                                  {message.split("] ")[0]?.replace("[", "")}
                                </div>
                                <div className="text-sm">
                                  {message.split("] ")[1] || message}
                                </div>
                              </div>
                            ))}
                          {analysisResult.result.formatted_messages.split("\n")
                            .length > 10 && (
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
  );
};
