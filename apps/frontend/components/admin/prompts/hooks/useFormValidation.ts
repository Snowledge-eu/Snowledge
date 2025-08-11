import { PromptForm as PromptFormType } from "../../shared/types";

export const useFormValidation = () => {
  const validateForm = (promptForm: PromptFormType): string[] => {
    const errors: string[] = [];

    // Validation du nom (requis)
    if (!promptForm.name.trim()) {
      errors.push("Le nom du prompt est requis");
    }

    // Validation de la description (optionnelle mais recommandée)
    if (!promptForm.description.trim()) {
      errors.push(
        "La description est recommandée pour clarifier l'objectif du prompt"
      );
    }

    // Validation de la température
    if (promptForm.temperature < 0 || promptForm.temperature > 2) {
      errors.push("La température doit être entre 0 et 2");
    }

    // Validation du top_p
    if (promptForm.top_p < 0 || promptForm.top_p > 1) {
      errors.push("Le top_p doit être entre 0 et 1");
    }

    return errors;
  };

  const isFormValid = (promptForm: PromptFormType): boolean => {
    return validateForm(promptForm).length === 0;
  };

  const getFieldError = (
    promptForm: PromptFormType,
    field: keyof PromptFormType
  ): string | null => {
    switch (field) {
      case "name":
        return !promptForm.name.trim() ? "Le nom est requis" : null;
      case "temperature":
        return promptForm.temperature < 0 || promptForm.temperature > 2
          ? "Entre 0 et 2"
          : null;
      case "top_p":
        return promptForm.top_p < 0 || promptForm.top_p > 1
          ? "Entre 0 et 1"
          : null;
      default:
        return null;
    }
  };

  return {
    validateForm,
    isFormValid,
    getFieldError,
  };
};
