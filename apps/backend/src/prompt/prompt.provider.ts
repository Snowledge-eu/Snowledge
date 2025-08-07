import {
	Injectable,
	Logger,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { PromptService } from './prompt.service';

import { AnalysisHelper } from '../analysis/analysis.helper';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { DiscordChannelService } from '../discord/services/discord-channel.service';
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
		private readonly analysisHelper: AnalysisHelper,
		private readonly discordMessageService: DiscordMessageService,
		private readonly discordChannelService: DiscordChannelService,
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
		this.logger.debug(`Total messages found: ${messages.length}`);

		// Récupérer tous les canaux
		const channels = await this.discordChannelService.findAll();
		this.logger.debug(`Total channels found: ${channels.length}`);

		// Filtrer les canaux qui appartiennent au serveur Discord de la communauté
		const communityChannels = channels.filter((channel) => {
			if (!community.discordServer) {
				return false;
			}
			return (
				channel.server_id.toString() === community.discordServer.guildId
			);
		});

		this.logger.debug(
			`Channels for community ${community.name}: ${communityChannels.length}`,
		);

		// Récupérer les IDs des canaux de la communauté (convertir en string)
		const communityChannelIds = communityChannels.map((channel) =>
			channel._id.toString(),
		);

		// Filtrer les messages par les canaux de la communauté (convertir en string)
		const communityMessages = messages.filter((msg) => {
			return communityChannelIds.includes(msg.channel_id.toString());
		});

		this.logger.debug(
			`Messages for community ${community.name}: ${communityMessages.length}`,
		);

		if (!communityMessages || communityMessages.length === 0) {
			throw new BadRequestException(
				`No messages found for community "${community.name}". Make sure the community has a Discord server connected and messages have been collected.`,
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

		// Lancer l'analyse IA
		const llmModel =
			testAnalysisDto.model_name &&
			testAnalysisDto.model_name !== 'default'
				? testAnalysisDto.model_name
				: prompt.model_name || 'Llama-3.1-8B-Instruct';

		try {
			// Appeler l'analyse IA avec le prompt personnalisé
			const analysisResult =
				await this.analysisHelper.analyseWithCustomPrompt({
					modelName: llmModel,
					customPrompt: prompt,
					userContent: formattedMessages,
				});

			// Sauvegarder l'analyse
			const savedAnalysis = await this.analysisHelper.saveAnalysis({
				creator_id: user.id,
				platform: 'discord',
				prompt_key: testAnalysisDto.prompt_name,
				llm_model: llmModel,
				scope: {
					server_id: community.discordServer.guildId,
					channel_id: 'test',
				},
				result: analysisResult,
			});

			// Retourner un objet simple sans les objets Mongoose complexes
			return {
				analysis_id:
					(savedAnalysis as any)._id?.toString() || 'unknown',
				prompt_used: prompt.name,
				community: community.name,
				message_count: communityMessages.length,
				result: {
					message_count: communityMessages.length,
					test_analysis: true,
					formatted_messages: formattedMessages,
					analysis_result: analysisResult,
				},
			};
		} catch (error) {
			this.logger.error('Error during analysis:', error);
			throw new BadRequestException(
				`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
			);
		}
	}
}
