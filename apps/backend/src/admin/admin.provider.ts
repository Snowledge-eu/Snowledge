import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CommunityService } from '../community/community.service';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminProvider {
	private readonly logger = new Logger(AdminProvider.name);

	constructor(
		private readonly communityService: CommunityService,
		private readonly discordMessageService: DiscordMessageService,
	) {}

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
