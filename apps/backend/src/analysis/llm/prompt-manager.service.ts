import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PromptService } from '../../prompt/prompt.service';

@Injectable()
export class PromptManagerService {
	private readonly logger = new Logger(PromptManagerService.name);

	constructor(private readonly promptService: PromptService) {}

	/**
	 * Récupère un prompt par son nom depuis la base de données uniquement
	 */
	async getPromptByName(promptName: string): Promise<any> {
		try {
			const dbPrompt = await this.promptService.findByName(promptName);
			if (!dbPrompt) {
				throw new NotFoundException(
					`Prompt '${promptName}' non trouvé en base de données`,
				);
			}

			this.logger.debug(
				`Prompt '${promptName}' trouvé en base de données`,
			);
			return this.convertDbPromptToConfig(dbPrompt);
		} catch (error) {
			this.logger.error(
				`Erreur lors de la récupération du prompt '${promptName}':`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Convertit un prompt de la base de données au format attendu par le PayloadBuilder
	 */
	private convertDbPromptToConfig(dbPrompt: any): any {
		return {
			name: dbPrompt.name,
			platform: dbPrompt.platform,
			description: dbPrompt.description,
			temperature: parseFloat(dbPrompt.temperature),
			top_p: parseFloat(dbPrompt.top_p),
			messages: dbPrompt.messages,
			response_format: dbPrompt.response_format,
			model_name: dbPrompt.model_name,
		};
	}

	/**
	 * Récupère tous les prompts publics de la base de données
	 */
	async getPublicPrompts(): Promise<any[]> {
		try {
			const prompts = await this.promptService.findPublic();
			return prompts.map((prompt) =>
				this.convertDbPromptToConfig(prompt),
			);
		} catch (error) {
			this.logger.error(
				'Erreur lors de la récupération des prompts publics:',
				error,
			);
			return [];
		}
	}

	/**
	 * Vérifie si un prompt existe en base de données
	 */
	async promptExistsInDb(promptName: string): Promise<boolean> {
		try {
			const prompt = await this.promptService.findByName(promptName);
			return !!prompt;
		} catch (error) {
			return false;
		}
	}
}
