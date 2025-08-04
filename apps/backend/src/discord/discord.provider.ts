import { Inject, Injectable, Logger } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { DiscordService } from './services/discord.service';
import { UserService } from '../user/user.service';
import discordConfig from '../config/discord.config';
import { ConfigType } from '@nestjs/config';
import { CommunityService } from '../community/community.service';
import { Community } from '../community/entities/community.entity';
import { DiscordServerService } from '../discord-server/discord-server.service';
import { DiscordClientHelper } from './helpers/discord-client.helper';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
import { DiscordChannelService } from './services/discord-channel.service';
import { DiscordMessageService } from './services/discord-message.service';
import { Types } from 'mongoose';

@Injectable()
export class DiscordProvider {
	private readonly logger = new Logger(DiscordProvider.name);
	constructor(
		@Inject(discordConfig.KEY)
		private configDiscord: ConfigType<typeof discordConfig>,
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
		private readonly communityService: CommunityService,
		private readonly discordServerService: DiscordServerService,
		private readonly discordClientHelper: DiscordClientHelper, // Ajout injection helper
		private readonly discordHarvestJobService: DiscordHarvestJobService,
		private readonly discordChannelService: DiscordChannelService,
		private readonly discordMessageService: DiscordMessageService,
	) {}

	async linkDiscord(code: string, user: User, communityId?: number) {
		let data: any;
		let community: Community;
		try {
			const response = await fetch(
				'https://discord.com/api/oauth2/token',
				{
					method: 'POST',
					body: new URLSearchParams({
						client_id: this.configDiscord.clientId,
						client_secret: this.configDiscord.clientSecret,
						code,
						grant_type: 'authorization_code',
						redirect_uri: this.configDiscord.redirect,
						scope: 'bot identify guilds email',
					}).toString(),
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				},
			);
			data = await response.json();
		} catch (error) {
			this.logger.error(error);
		}

		if (data && !data.error) {
			const discordAccess = await this.discordService.createDiscordAccess(
				{
					accessToken: data.access_token,
					tokenType: data.token_type,
					expiresIn: data.expires_in,
					refreshToken: data.refresh_token,
					scope: data.scope,
				},
			);

			let userInfo;
			try {
				const userResult = await fetch(
					'https://discord.com/api/users/@me',
					{
						headers: {
							authorization: `${data.token_type} ${data.access_token}`,
						},
					},
				);
				userInfo = await userResult.json();
			} catch (error) {
				this.logger.error(error);
			}

			if (userInfo) {
				if (communityId) {
					try {
						// community =
						// 	await this.communityService.findOneById(
						// 		communityId,
						// 	);

						const discordServer =
							await this.discordServerService.create({
								// communityId,
								guildId: data.guild.id,
								guildName: data.guild.name,
							});

						community =
							await this.communityService.updateDiscordGuildId(
								communityId,
								discordServer,
							);
					} catch (error) {
						this.logger.error(error);
						throw new Error('Error creating discord server', error);
					}
				}
				await this.userService.update(user.id, {
					discordId: userInfo.id,
					discordAccess: discordAccess,
				});
			}
		} else {
			this.logger.error('Error client information', data && data.error ? data.error : data);
		}
		return community;
	}
	async disconnectDiscord(user: User) {
		const findUser = await this.userService.findOneByEmail(user.email);

		await this.userService.update(user.id, {
			discordId: '',
			discordAccess: null,
		});
		if(findUser.discordAccess) {
			await this.discordService.delete(findUser.discordAccess.id);
		}
		// TODO enelver le bot discord du serveur si c'est le créateur 
	}

	async listDiscordServers(): Promise<Array<{ id: string; name: string }>> {
		const client = this.discordClientHelper.getClient();
		const guilds = client.guilds.cache.map(guild => ({
			id: guild.id,
			name: guild.name,
		}));
		return guilds;
	}

	async getHarvestJobStatus(jobId: string): Promise<any> {
		let job;
		try {
			job = await this.discordHarvestJobService['harvestJobModel'].findById(new Types.ObjectId(jobId)).lean();
		} catch (e) {
			throw new Error('Invalid job_id format');
		}
		if (!job) {
			throw new Error('Job not found');
		}
		return {
			job_id: job._id.toString(),
			status: job.status,
			inserted: job.inserted,
			finished_at: job.finished_at,
			error: job.error,
		};
	}

	async getLastHarvest(guildId: string): Promise<any> {
		const last = await this.discordHarvestJobService.findLastHarvestJobByDiscordServerId(guildId);
		if (!last) {
			return null;
		}
		const arrInfo: Array<{ name: string; qty: number }> = [];
		for (const channel of last.channels) {
			const channelInfo = await this.discordChannelService.findOne(channel.toString());
			const countMess = await this.discordMessageService.countMessageForDate(channel, last.created_at);
			arrInfo.push({
				name: channelInfo.name,
				qty: countMess,
			});
		}
		const lastFetched = {
			date: last.created_at,
			channels: arrInfo,
		};
		return { ...last, lastFetched };
	}

	async countMessageInterval(info: { channelId: string[]; interval: 'last_day' | 'last_week' | 'last_month' }): Promise<number> {
		const now = new Date();
		let startDate: Date;
		let count = 0;
		switch (info.interval) {
			case 'last_day':
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 1);
				break;
			case 'last_week':
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 7);
				break;
			case 'last_month':
				startDate = new Date(now);
				startDate.setMonth(now.getMonth() - 1);
				break;
			default:
				throw new Error(`Invalid interval: ${info.interval}`);
		}
		for (const id of info.channelId) {
			const tmpcount = await this.discordMessageService.countMessageForPeriod(id, startDate);
			count += tmpcount;
		}
		return count;
	}

	async harvestDiscord(dto: any): Promise<{ job_id: string, status: string } | undefined> {
		try {
			this.logger.verbose(JSON.stringify(dto));
			const jobId = await this.discordHarvestJobService.addJob(dto);
			return { job_id: jobId, status: 'queued' };
		} catch (error) {
			this.logger.error(error);
		}
	}
}
