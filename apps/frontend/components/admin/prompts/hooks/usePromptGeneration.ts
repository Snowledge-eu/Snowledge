import { PromptForm as PromptFormType } from "../../shared/types";
import {
  AVAILABLE_ROLES,
  AVAILABLE_MODES,
  AVAILABLE_ACTIONS,
  AVAILABLE_OUTPUTS,
} from "../../shared/constants";

export const usePromptGeneration = () => {
  // Fonctions utilitaires pour obtenir les informations d'un élément
  const getRole = (id: string) => AVAILABLE_ROLES.find((r) => r.id === id);
  const getMode = (id: string) => AVAILABLE_MODES.find((m) => m.id === id);
  const getAction = (id: string) => AVAILABLE_ACTIONS.find((a) => a.id === id);
  const getOutput = (id: string) => AVAILABLE_OUTPUTS.find((o) => o.id === id);

  // Générer automatiquement le message système basé sur le rôle et les actions
  const generateSystemMessage = (promptForm: PromptFormType): string => {
    let systemMessage =
      "You are an AI assistant specialized in analyzing community data.";

    // Ajouter le contexte du rôle
    if (promptForm.role_id) {
      const selectedRole = getRole(promptForm.role_id);
      if (selectedRole) {
        systemMessage += ` ${selectedRole.systemPromptAddition}`;
      }
    }

    // Ajouter les actions spécifiques
    if (promptForm.selected_actions && promptForm.selected_actions.length > 0) {
      const actionDescriptions = promptForm.selected_actions
        .map((actionId) => {
          const action = getAction(actionId);
          return action ? action.description : null;
        })
        .filter(Boolean);

      if (actionDescriptions.length > 0) {
        systemMessage +=
          "\n\nYour specific tasks include:\n" +
          actionDescriptions.map((desc) => `- ${desc}`).join("\n");
      }
    }

    // Ajouter les instructions pour les outputs structurés
    if (promptForm.selected_outputs && promptForm.selected_outputs.length > 0) {
      const outputNames = promptForm.selected_outputs
        .map((outputId) => {
          const output = getOutput(outputId);
          return output ? output.name : null;
        })
        .filter(Boolean);

      systemMessage +=
        "\n\nProvide your analysis in JSON format including these elements:\n" +
        outputNames.map((name) => `- ${name}`).join("\n");
    }

    // Ajouter l'instruction pour le raisonnement
    if (promptForm.show_reasoning) {
      systemMessage +=
        "\n\nInclude a 'reasoning' field explaining your analytical process step by step.";
    }

    return systemMessage;
  };

  // Générer automatiquement le schema basé sur les selected_outputs
  const generateResponseFormat = (promptForm: PromptFormType) => {
    if (
      !promptForm.selected_outputs ||
      promptForm.selected_outputs.length === 0
    ) {
      return undefined; // Pas de schema si aucun output sélectionné
    }

    const properties: any = {};
    const required: string[] = [];

    promptForm.selected_outputs.forEach((outputId) => {
      const output = getOutput(outputId);
      if (output) {
        required.push(outputId);

        switch (output.type) {
          case "string":
            properties[outputId] = {
              type: "string",
              title: output.name,
            };
            break;
          case "number":
            properties[outputId] = {
              type: "number",
              title: output.name,
            };
            break;
          case "boolean":
            properties[outputId] = {
              type: "boolean",
              title: output.name,
            };
            break;
          case "array":
            properties[outputId] = {
              type: "array",
              items: { type: "string" },
              title: output.name,
            };
            break;
          case "object":
            properties[outputId] = {
              type: "object",
              title: output.name,
            };
            break;
        }
      }
    });

    // Ajouter le raisonnement si activé
    if (promptForm.show_reasoning) {
      properties.reasoning = {
        type: "string",
        title: "Raisonnement du LLM",
      };
      required.push("reasoning");
    }

    // Générer un nom automatique basé sur le nom du prompt
    const schemaName = promptForm.name
      ? promptForm.name.replace(/\s+/g, "") + "Schema"
      : "CustomSchema";

    return {
      type: "json_schema" as const,
      json_schema: {
        name: promptForm.response_format?.json_schema?.name || schemaName,
        schema: {
          $defs: {},
          properties,
          required,
          title: promptForm.response_format?.json_schema?.name || schemaName,
          type: "object",
        },
      },
    };
  };

  // Générer un aperçu complet de ce qui sera envoyé
  const generateFinalPromptPreview = (promptForm: PromptFormType) => {
    const generatedResponseFormat = generateResponseFormat(promptForm);
    const generatedSystemMessage = generateSystemMessage(promptForm);

    return {
      name: promptForm.name,
      description: promptForm.description,
      platform: promptForm.platform,
      model_name: promptForm.model_name,
      temperature: promptForm.temperature,
      top_p: promptForm.top_p,
      messages: [
        { role: "system", content: generatedSystemMessage },
        { role: "user", content: "{{messages}}" },
      ],
      response_format: generatedResponseFormat,
      is_public: promptForm.is_public,
      // Nouveaux champs
      role_id: promptForm.role_id,
      mode_id: promptForm.mode_id,
      selected_actions: promptForm.selected_actions,
      selected_outputs: promptForm.selected_outputs,
      show_reasoning: promptForm.show_reasoning,
      tools_enabled: promptForm.tools_enabled,
    };
  };

  return {
    getRole,
    getMode,
    getAction,
    getOutput,
    generateSystemMessage,
    generateResponseFormat,
    generateFinalPromptPreview,
  };
};
