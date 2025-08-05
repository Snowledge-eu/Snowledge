import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CommunityService } from '../community/community.service';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { AnalysisService } from '../analysis/analysis.service';
import { PromptService } from '../prompt/prompt.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminProvider {
	private readonly logger = new Logger(AdminProvider.name);

	constructor(
		private readonly communityService: CommunityService,
		private readonly discordMessageService: DiscordMessageService,
		private readonly analysisService: AnalysisService,
		private readonly promptService: PromptService,
	) {}

	async getPrompts(): Promise<any[]> {
		try {
			const prompts = await this.promptService.findAll();
			return prompts.map((prompt) => ({
				id: prompt.id,
				name: prompt.name,
				description: prompt.description,
				platform: prompt.platform,
				temperature: prompt.temperature,
				top_p: prompt.top_p,
				messages: prompt.messages,
				response_format: prompt.response_format,
				is_public: prompt.is_public,
				model_name: prompt.model_name,
				created_by: prompt.created_by
					? {
							id: prompt.created_by.id,
							firstname: prompt.created_by.firstname,
							lastname: prompt.created_by.lastname,
							pseudo: prompt.created_by.pseudo,
						}
					: null,
				created_at: prompt.created_at,
			}));
		} catch (error) {
			this.logger.error('Error fetching prompts:', error);
			throw new BadRequestException('Failed to fetch prompts');
		}
	}

	async getCommunities(): Promise<any[]> {
		const communities = await this.communityService.findAll();
		return communities.map((community) => ({
			id: community.id,
			name: community.name,
			slug: community.slug,
			description: community.description,
			user: community.user
				? {
						id: community.user.id,
						firstname: community.user.firstname,
						lastname: community.user.lastname,
						pseudo: community.user.pseudo,
					}
				: null,
			discordServer: community.discordServer
				? {
						guildId: community.discordServer.guildId,
						guildName: community.discordServer.guildName,
					}
				: null,
			created_at: community.created_at,
		}));
	}

	async getAnalysisHistory(filters: {
		platform?: string;
		prompt_key?: string;
		community?: string;
		date_from?: string;
		date_to?: string;
		sort_order?: string;
	}): Promise<any[]> {
		try {
			// Construire les filtres MongoDB
			const mongoFilters: any = {};

			if (filters.platform && filters.platform !== 'all') {
				mongoFilters.platform = filters.platform;
			}

			if (filters.prompt_key && filters.prompt_key !== 'all') {
				mongoFilters.prompt_key = filters.prompt_key;
			}

			if (filters.date_from || filters.date_to) {
				mongoFilters.created_at = {};
				if (filters.date_from) {
					// Pour "from", on veut inclure toute la journée, donc on commence à 00:00:00
					const fromDate = new Date(filters.date_from);
					fromDate.setHours(0, 0, 0, 0);
					mongoFilters.created_at.$gte = fromDate;
				}
				if (filters.date_to) {
					// Pour "to", on veut inclure toute la journée, donc on finit à 23:59:59
					const toDate = new Date(filters.date_to);
					toDate.setHours(23, 59, 59, 999);
					mongoFilters.created_at.$lte = toDate;
				}
			}

			// Récupérer toutes les analyses avec les filtres
			const analyses = await this.analysisService.findAll();

			// Filtrer les résultats côté application si nécessaire
			let filteredAnalyses = analyses.filter((analysis: any) => {
				// Filtre par communauté si spécifié
				if (filters.community && filters.community !== 'all') {
					// Vérifier si l'analyse concerne la communauté spécifiée
					// Cette logique peut être adaptée selon la structure des données
					return true; // Pour l'instant, accepter toutes les analyses
				}
				return true;
			});

			// Appliquer les filtres MongoDB
			if (Object.keys(mongoFilters).length > 0) {
				filteredAnalyses = filteredAnalyses.filter((analysis: any) => {
					if (
						mongoFilters.platform &&
						analysis.platform !== mongoFilters.platform
					) {
						return false;
					}
					if (
						mongoFilters.prompt_key &&
						analysis.prompt_key !== mongoFilters.prompt_key
					) {
						return false;
					}
					if (mongoFilters.created_at) {
						const createdAt = new Date(analysis.created_at);

						if (mongoFilters.created_at.$gte) {
							const fromDate = new Date(
								mongoFilters.created_at.$gte,
							);
							fromDate.setHours(0, 0, 0, 0);
							if (createdAt < fromDate) {
								return false;
							}
						}

						if (mongoFilters.created_at.$lte) {
							const toDate = new Date(
								mongoFilters.created_at.$lte,
							);
							toDate.setHours(23, 59, 59, 999);
							if (createdAt > toDate) {
								return false;
							}
						}
					}
					return true;
				});
			}

			// Trier par date de création selon l'ordre spécifié
			filteredAnalyses.sort((a: any, b: any) => {
				const dateA = new Date(a.created_at).getTime();
				const dateB = new Date(b.created_at).getTime();

				if (filters.sort_order === 'asc') {
					// Oldest first: plus ancien en premier
					return dateA - dateB;
				} else {
					// Newest first: plus récent en premier (par défaut)
					return dateB - dateA;
				}
			});

			// Formater les dates pour le frontend
			return filteredAnalyses.map((analysis: any) => ({
				...analysis,
				created_at: analysis.created_at
					? new Date(analysis.created_at).toISOString()
					: null,
				updated_at: analysis.updated_at
					? new Date(analysis.updated_at).toISOString()
					: null,
			}));
		} catch (error) {
			this.logger.error('Error fetching analysis history:', error);
			throw new BadRequestException('Failed to fetch analysis history');
		}
	}

	async getAllCommunities(user: User): Promise<any[]> {
		if (!user.isAdmin) {
			throw new BadRequestException(
				'Only admins can access this endpoint',
			);
		}

		const communities = await this.communityService.findAll();
		return communities.map((community) => ({
			id: community.id,
			name: community.name,
			slug: community.slug,
			description: community.description,
			user: community.user
				? {
						id: community.user.id,
						firstname: community.user.firstname,
						lastname: community.user.lastname,
						pseudo: community.user.pseudo,
					}
				: null,
			discordServer: community.discordServer
				? {
						guildId: community.discordServer.guildId,
						guildName: community.discordServer.guildName,
					}
				: null,
			created_at: community.created_at,
		}));
	}

	async getCommunityMessages(communityId: number, user: User): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException(
				'Only admins can access this endpoint',
			);
		}

		const community = await this.communityService.findOneById(communityId);
		if (!community) {
			throw new BadRequestException('Community not found');
		}

		const allMessages = await this.discordMessageService.findAll();
		const communityMessages = allMessages.filter(
			(msg) =>
				msg.channel_id &&
				community.discordServer &&
				msg.channel_id.toString() === community.discordServer.guildId,
		);

		return {
			community: {
				id: community.id,
				name: community.name,
				slug: community.slug,
			},
			messages: communityMessages.slice(0, 100), // Limiter à 100 messages
			total_count: communityMessages.length,
		};
	}

	async getAdminStats(user: User): Promise<any> {
		if (!user.isAdmin) {
			throw new BadRequestException(
				'Only admins can access this endpoint',
			);
		}

		const communities = await this.communityService.findAll();
		const allMessages = await this.discordMessageService.findAll();

		return {
			total_communities: communities.length,
			total_messages: allMessages.length,
			communities_with_discord: communities.filter((c) => c.discordServer)
				.length,
			recent_communities: communities
				.sort(
					(a, b) =>
						new Date(b.created_at).getTime() -
						new Date(a.created_at).getTime(),
				)
				.slice(0, 5)
				.map((c) => ({
					id: c.id,
					name: c.name,
					created_at: c.created_at,
				})),
		};
	}
}
