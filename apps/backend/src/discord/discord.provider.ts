import { Inject, Injectable, Logger } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { DiscordService } from './services/discord.service';
import { UserService } from 'src/user/user.service';
import discordConfig from 'src/config/discord.config';
import { ConfigType } from '@nestjs/config';
import { CommunityService } from 'src/community/community.service';
import { Community } from 'src/community/entities/community.entity';
import { DiscordServerService } from 'src/discord-server/discord-server.service';
import { DiscordClientHelper } from './helpers/discord-client.helper';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
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
			this.logger.error('Error client information', data.error);
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
}
