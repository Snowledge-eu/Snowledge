import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DiscordAnalyzeDto, AnalyzePeriod } from './dto/discord-analyse.dto';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { AnalysisHelper } from './analysis.helper';
import { AnalysisService } from './analysis.service';
import { PromptProvider } from '../prompt/prompt.provider';
import { DiscordChannelService } from '../discord/services/discord-channel.service';
import { DiscordProposalProvider } from '../discord-bot/providers/discord-proposal.provider';
import { CommunityService } from '../community/community.service';
import { TestAnalysisDto } from './dto/test-analysis.dto';
import { User } from '../user/entities/user.entity';
import {
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
} from '@nestjs/common';
import { Long } from 'bson';

@Injectable()
export class AnalysisProvider {
	private readonly logger = new Logger(AnalysisProvider.name);
	constructor(
		private readonly discordMessageService: DiscordMessageService,
		private readonly discordChannelService: DiscordChannelService,
		private readonly discordProposalProvider: DiscordProposalProvider,
		private readonly communityService: CommunityService,
		private readonly analysisHelper: AnalysisHelper,
		private readonly analysisService: AnalysisService,
		private readonly promptProvider: PromptProvider,
	) {}

	async analyzeDiscord(dto: DiscordAnalyzeDto): Promise<any> {
		const now = new Date();
		const since = this.getSinceDate(dto.period, now);
		const messages = await this.discordMessageService.findMessagesInRange(
			dto.channelId,
			since,
			now,
		);
		if (!messages.length) {
			throw new HttpException(
				'No messages found for this period.',
				HttpStatus.NO_CONTENT,
			);
		}
		const formatted = this.formatMessages(messages);
		return this.handleLlmCall(dto, formatted, since, now);
	}

	async findByScope(findAnalysis: any): Promise<any> {
		this.logger.verbose(JSON.stringify(findAnalysis));
		if (findAnalysis.platform === 'discord') {
			if (!findAnalysis.scope.channelId) {
				return this.analysisService.findByDiscordServer(
					findAnalysis.scope.serverId,
					findAnalysis.promptKey,
					findAnalysis.creator_id,
				);
			}
			return this.analysisService.findByDiscordScope(
				findAnalysis.scope.serverId,
				findAnalysis.scope.channelId,
				findAnalysis.promptKey,
				findAnalysis.creator_id,
			);
		}
		// Ajouter d'autres plateformes ici si besoin
		return [];
	}

	async trendToContent(analyseId: string, trendIndex = 0): Promise<any> {
		let analysis;
		try {
			analysis = await this.analysisService.findById(analyseId);
		} catch {
			throw new BadRequestException('Invalid analyse_id format');
		}
		if (!analysis) {
			throw new NotFoundException('Analyse not found');
		}
		let parsedResult: any;
		try {
			const raw = analysis.result?.choices?.[0]?.message?.content;
			parsedResult = JSON.parse(raw);
		} catch {
			throw new InternalServerErrorException(
				'Failed to parse LLM analysis content',
			);
		}
		const trends = parsedResult?.trends || [];
		if (!trends.length) {
			throw new BadRequestException(
				'No trends found in the analysis result',
			);
		}
		if (trendIndex >= trends.length) {
			throw new BadRequestException(
				`Trend index ${trendIndex} out of range. Only ${trends.length} trend(s) available.`,
			);
		}
		const selectedTrend = trends[trendIndex];
		const trendInput = {
			trend_title: selectedTrend?.title,
			summary: selectedTrend?.summary,
			representative_messages:
				selectedTrend?.representative_messages || [],
			activity_level: selectedTrend?.activity_level,
			timeframe: analysis.result?.timeframe,
		};
		const modelName = analysis.llm_model;
		try {
			const response = await this.analysisHelper.trendToContent({
				modelName,
				promptKey: 'trend_to_content',
				trend: trendInput,
			});
			// Retourner toutes les infos nécessaires au controller pour le stockage
			return {
				response,
				analysis,
				trendInput,
				trendIndex,
				selectedTrend,
			};
		} catch (e) {
			throw new InternalServerErrorException(`LLM error: ${e}`);
		}
	}

	private getSinceDate(period: AnalyzePeriod, now: Date): Date {
		switch (period) {
			case AnalyzePeriod.LAST_DAY:
				return new Date(now.getTime() - 24 * 60 * 60 * 1000);
			case AnalyzePeriod.LAST_WEEK:
				return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			case AnalyzePeriod.LAST_MONTH:
				return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
			default:
				throw new HttpException(
					'Invalid period',
					HttpStatus.BAD_REQUEST,
				);
		}
	}

	private formatMessages(messages: any[]): string[] {
		return messages
			.sort(
				(a, b) =>
					new Date(a.created_at_by_discord).getTime() -
					new Date(b.created_at_by_discord).getTime(),
			)
			.map((msg) => {
				const dt = new Date(msg.created_at_by_discord)
					.toISOString()
					.slice(0, 16)
					.replace('T', ' ');
				const user = msg.author_name || msg.user_id?.toString() || '?';
				return `[${dt}] ${user}: ${msg.content}`;
			});
	}

	private async handleLlmCall(
		dto: DiscordAnalyzeDto,
		formatted: string[],
		since: Date,
		now: Date,
	): Promise<any> {
		try {
			// Récupérer le prompt depuis la base de données
			const prompt = await this.promptProvider.getPromptByName(
				dto.prompt_key,
			);

			const ovhResponse =
				await this.analysisHelper.analyseWithCustomPrompt({
					modelName: prompt.model_name,
					customPrompt: prompt,
					userContent: formatted,
				});

			const newAnalysis = await this.analysisHelper.saveAnalysis({
				creator_id: dto.creator_id,
				platform: 'discord',
				prompt_key: dto.prompt_key,
				llm_model: prompt.model_name,
				scope: {
					server_id: dto.serverId,
					channel_id: dto.channelId,
				},
				period: {
					from: since,
					to: now,
				},
				result: ovhResponse,
			});

			return newAnalysis;
		} catch (e) {
			throw new HttpException(
				`LLM error: ${e}`,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	/**
	 * Teste un prompt avec une vraie analyse (pour les admins)
	 */
	async testAnalysis(
		testAnalysisDto: TestAnalysisDto,
		user: User,
	): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException('Only admins can test analyses');
		}

		// Récupérer le prompt depuis le PromptProvider
		const prompt = await this.promptProvider.getPromptByName(
			testAnalysisDto.prompt_name,
		);
		if (!prompt) {
			throw new NotFoundException('Prompt not found');
		}

		// Récupérer la communauté
		const community = await this.communityService.findOneById(
			parseInt(testAnalysisDto.community_id),
		);
		if (!community) {
			throw new NotFoundException('Community not found');
		}

		this.logger.debug(
			`Community found: ${community.name} (ID: ${community.id})`,
		);
		this.logger.debug(
			`Community discordServer: ${JSON.stringify(community.discordServer)}`,
		);
		this.logger.debug(
			`Community discordServerId: ${community.discordServerId}`,
		);

		// Récupérer le guildId de la communauté
		const guildId =
			community.discordServer?.guildId || community.discordServerId;
		if (!guildId) {
			throw new BadRequestException(
				`Community "${community.name}" has no Discord server connected.`,
			);
		}

		this.logger.debug(`Fetching channels for guild: ${guildId}`);

		// Récupérer les canaux textuels du serveur Discord via l'API Discord
		const discordChannels =
			await this.discordProposalProvider.listTextChannels(guildId);
		this.logger.debug(
			`Found ${discordChannels.length} text channels in Discord`,
		);

		// Récupérer les IDs des canaux
		const channelIds = discordChannels.map((ch) => ch.id);
		this.logger.debug(`Channel IDs: ${channelIds.join(', ')}`);

		// Récupérer les messages des canaux du serveur Discord
		const communityMessages =
			await this.discordMessageService.findMessagesByChannelIds(
				channelIds,
			);

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
