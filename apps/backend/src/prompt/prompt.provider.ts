import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PromptService } from './prompt.service';

import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PromptProvider {
	private readonly logger = new Logger(PromptProvider.name);

	constructor(private readonly promptService: PromptService) {}

	async createPrompt(
		createPromptDto: CreatePromptDto,
		user: User,
	): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can create prompts');
		}

		// Nettoyer le response_format si il est incomplet
		const cleanedDto = this.cleanResponseFormat(createPromptDto);

		const existingPrompt = await this.promptService.findByName(
			createPromptDto.name,
		);
		if (existingPrompt) {
			throw new BadRequestException(
				'Prompt with this name already exists',
			);
		}

		// Validation basique de la structure du prompt
		if (
			!createPromptDto.name ||
			!createPromptDto.description ||
			!createPromptDto.platform ||
			createPromptDto.temperature === undefined ||
			createPromptDto.top_p === undefined ||
			!createPromptDto.messages
		) {
			throw new BadRequestException('Invalid prompt structure');
		}

		return this.promptService.create(cleanedDto, user.id);
	}

	async getAllPrompts(user: User): Promise<any[]> {
		if (!user.isAdmin) {
			return this.promptService.findPublic();
		}
		return this.promptService.findAll();
	}

	async getPrompt(id: number, user: User): Promise<any> {
		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		if (!prompt.is_public && !user.isAdmin) {
			throw new BadRequestException('Access denied');
		}

		return prompt;
	}

	async updatePrompt(
		id: number,
		updatePromptDto: UpdatePromptDto,
		user: User,
	): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can update prompts');
		}

		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		// Nettoyer le response_format si il est incomplet
		const cleanedDto = this.cleanResponseFormat(updatePromptDto);

		return this.promptService.update(id, cleanedDto);
	}

	async deletePrompt(id: number, user: User): Promise<void> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can delete prompts');
		}

		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		await this.promptService.remove(id);
	}

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

	/**
	 * Nettoie le response_format pour s'assurer qu'il est complet ou supprimé
	 */
	private cleanResponseFormat(dto: any): any {
		const cleaned = { ...dto };

		// Si response_format existe mais est incomplet, on le supprime
		if (
			cleaned.response_format &&
			(!cleaned.response_format.type ||
				!cleaned.response_format.json_schema ||
				!cleaned.response_format.json_schema.name ||
				!cleaned.response_format.json_schema.schema)
		) {
			console.log(
				'Removing incomplete response_format:',
				cleaned.response_format,
			);
			delete cleaned.response_format;
		}

		return cleaned;
	}

	// ============
	// MÉTHODES POUR LES UTILISATEURS NORMAUX
	// ============

	/**
	 * Créer un prompt pour un utilisateur normal
	 */
	async createUserPrompt(
		createPromptDto: CreatePromptDto,
		user: User,
	): Promise<any> {
		// Nettoyer le response_format si il est incomplet
		const cleanedDto = this.cleanResponseFormat(createPromptDto);

		// Vérifier que le nom n'existe pas déjà
		const existingPrompt = await this.promptService.findByName(
			createPromptDto.name,
		);
		if (existingPrompt) {
			throw new BadRequestException(
				'Prompt with this name already exists',
			);
		}

		// Validation basique de la structure du prompt
		if (
			!createPromptDto.name ||
			!createPromptDto.description ||
			!createPromptDto.platform ||
			createPromptDto.temperature === undefined ||
			createPromptDto.top_p === undefined ||
			!createPromptDto.messages
		) {
			throw new BadRequestException('Invalid prompt structure');
		}

		// Les prompts créés par les utilisateurs normaux sont privés par défaut
		cleanedDto.is_public = false;

		return this.promptService.create(cleanedDto, user.id);
	}

	/**
	 * Récupérer les prompts d'un utilisateur (ses propres prompts + les publics)
	 */
	async getUserPrompts(user: User): Promise<any[]> {
		const userPrompts = await this.promptService.findByUserId(user.id);
		const publicPrompts = await this.promptService.findPublic();

		// Combiner et dédupliquer
		const allPrompts = [...userPrompts, ...publicPrompts];
		const uniquePrompts = allPrompts.filter(
			(prompt, index, self) =>
				index === self.findIndex((p) => p.id === prompt.id),
		);

		return uniquePrompts;
	}

	/**
	 * Récupérer les prompts publics seulement
	 */
	async getPublicPrompts(): Promise<any[]> {
		return this.promptService.findPublic();
	}

	/**
	 * Récupérer un prompt spécifique pour un utilisateur
	 */
	async getUserPrompt(id: number, user: User): Promise<any> {
		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		// L'utilisateur peut voir ses propres prompts ou les prompts publics
		if (!prompt.is_public && prompt.created_by.id !== user.id) {
			throw new BadRequestException('Access denied');
		}

		return prompt;
	}

	/**
	 * Mettre à jour un prompt utilisateur
	 */
	async updateUserPrompt(
		id: number,
		updatePromptDto: UpdatePromptDto,
		user: User,
	): Promise<any> {
		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		// Seul le créateur peut modifier son prompt
		if (prompt.created_by.id !== user.id) {
			throw new BadRequestException(
				'You can only update your own prompts',
			);
		}

		// Nettoyer le response_format si il est incomplet
		const cleanedDto = this.cleanResponseFormat(updatePromptDto);

		// Les utilisateurs normaux ne peuvent pas rendre leurs prompts publics
		if (cleanedDto.is_public === true) {
			delete cleanedDto.is_public;
		}

		return this.promptService.update(id, cleanedDto);
	}

	/**
	 * Supprimer un prompt utilisateur
	 */
	async deleteUserPrompt(id: number, user: User): Promise<void> {
		const prompt = await this.promptService.findOne(id);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		// Seul le créateur peut supprimer son prompt
		if (prompt.created_by.id !== user.id) {
			throw new BadRequestException(
				'You can only delete your own prompts',
			);
		}

		await this.promptService.remove(id);
	}
}
