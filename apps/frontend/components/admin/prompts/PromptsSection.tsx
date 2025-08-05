import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { PromptList } from "./PromptList";
import { PromptForm } from "./PromptForm";
import { Prompt, PromptForm as PromptFormType } from "../shared/types";

export const PromptsSection = () => {
  const { fetcher } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isCreatingPrompt, setIsCreatingPrompt] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const fetchPrompts = async () => {
    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`
      );
      if (response.ok && response.data) {
        setPrompts(response.data);
      }
    } catch (error) {
      console.error("Error fetching prompts:", error);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleCreatePrompt = async (formData: PromptFormType) => {
    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok && response.data) {
        const newPrompt = response.data;
        setPrompts([newPrompt, ...prompts]);
        setIsCreatingPrompt(false);
      }
    } catch (error) {
      console.error("Error creating prompt:", error);
    }
  };

  const handleUpdatePrompt = async (formData: PromptFormType) => {
    if (!selectedPrompt) return;

    try {
      const response = await fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/prompts/${selectedPrompt.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok && response.data) {
        const updatedPrompt = response.data;
        setPrompts(
          prompts.map((p) => (p.id === selectedPrompt.id ? updatedPrompt : p))
        );
        setIsEditingPrompt(false);
        setSelectedPrompt(null);
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

  const handleEditPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsEditingPrompt(true);
    setIsCreatingPrompt(false);
  };

  const handleCreateNew = () => {
    setIsCreatingPrompt(true);
    setIsEditingPrompt(false);
    setSelectedPrompt(null);
  };

  const handleCancel = () => {
    setIsCreatingPrompt(false);
    setIsEditingPrompt(false);
    setSelectedPrompt(null);
  };

  const handleSubmit = (formData: PromptFormType) => {
    if (isCreatingPrompt) {
      handleCreatePrompt(formData);
    } else if (isEditingPrompt) {
      handleUpdatePrompt(formData);
    }
  };

  return (
    <div className="space-y-6">
      <PromptList
        prompts={prompts}
        onEdit={handleEditPrompt}
        onDelete={handleDeletePrompt}
        onCreate={handleCreateNew}
      />

      {(isCreatingPrompt || isEditingPrompt) && (
        <PromptForm
          isCreating={isCreatingPrompt}
          isEditing={isEditingPrompt}
          selectedPrompt={selectedPrompt}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
