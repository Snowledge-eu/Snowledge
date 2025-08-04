import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PromptService } from './prompt.service';
import { PromptHelper } from './prompt.helper';
import { AnalysisService } from '../analysis/analysis.service';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { CommunityService } from '../community/community.service';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { TestAnalysisDto } from './dto/test-analysis.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class PromptProvider {
	private readonly logger = new Logger(PromptProvider.name);

	constructor(
		private readonly promptService: PromptService,
		private readonly promptHelper: PromptHelper,
		private readonly analysisService: AnalysisService,
		private readonly discordMessageService: DiscordMessageService,
		private readonly communityService: CommunityService,
	) {}

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

		if (!this.promptHelper.validatePromptStructure(createPromptDto)) {
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

	async migrateYamlPrompts(user: User): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can migrate prompts');
		}

		const yamlData = await this.promptHelper.loadYamlPrompts();
		const prompts = yamlData.prompt_models;
		const migratedPrompts = [];

		for (const [name, promptData] of Object.entries(prompts)) {
			const prompt = promptData as any;
			const formattedPrompt =
				this.promptHelper.formatPromptForAnalysis(prompt);

			try {
				const existingPrompt =
					await this.promptService.findByName(name);
				if (!existingPrompt) {
					const createdPrompt = await this.promptService.create(
						{
							...formattedPrompt,
							name,
							is_public: true,
						},
						user.id,
					);
					migratedPrompts.push(createdPrompt);
				}
			} catch (error) {
				this.logger.error(
					`Failed to migrate prompt ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
				);
			}
		}

		return { migrated: migratedPrompts.length, prompts: migratedPrompts };
	}

	async testAnalysis(
		testAnalysisDto: TestAnalysisDto,
		user: User,
	): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can test analyses');
		}

		const prompt = await this.promptService.findByName(
			testAnalysisDto.prompt_name,
		);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		const community = await this.communityService.findOneById(
			parseInt(testAnalysisDto.community_id),
		);
		if (!community) {
			throw new NotFoundException('Community not found');
		}

		// Récupérer les messages Discord de la communauté
		const messages = await this.discordMessageService.findAll();
		const communityMessages = messages.filter(
			(msg) =>
				msg.channel_id &&
				community.discordServer &&
				msg.channel_id.toString() === community.discordServer.guildId,
		);

		if (!communityMessages || communityMessages.length === 0) {
			throw new BadRequestException(
				'No messages found for this community',
			);
		}

		// Préparer les données pour l'analyse
		const formattedMessages = communityMessages
			.slice(0, 50) // Limiter à 50 messages pour le test
			.map(
				(msg) =>
					`[${msg.created_at_by_discord}] ${msg.author_name}: ${msg.content}`,
			)
			.join('\n');

		// Créer une analyse de test
		const analysisData = {
			creator_id: user.id,
			platform: 'discord',
			prompt_key: testAnalysisDto.prompt_name,
			llm_model:
				testAnalysisDto.model_name &&
				testAnalysisDto.model_name !== 'default'
					? testAnalysisDto.model_name
					: prompt.model_name || 'llama3.1-8b-instruct',
			scope: {
				server_id: community.discordServer.guildId,
				channel_id: 'test',
			},
			result: {
				message_count: communityMessages.length,
				formatted_messages: formattedMessages,
				test_analysis: true,
				max_tokens: testAnalysisDto.max_tokens || 2000,
			},
		};

		// Lancer l'analyse
		const result = await this.analysisService.create(analysisData);

		return {
			analysis_id: result._id,
			prompt_used: prompt.name,
			community: community.name,
			message_count: communityMessages.length,
			result: result,
		};
	}
}
