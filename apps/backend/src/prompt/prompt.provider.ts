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

		return this.promptService.create(createPromptDto, user.id);
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

		return this.promptService.update(id, updatePromptDto);
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
