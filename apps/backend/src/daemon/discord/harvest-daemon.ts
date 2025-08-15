/**
 * Discord Harvest Daemon
 *
 * Ce daemon est responsable de la récupération automatique des messages Discord.
 * Il remplace l'ancien service Python analyzer.
 */

import { NestFactory } from '@nestjs/core';
import { DiscordMessageService } from '../../discord/services/discord-message.service';
import { AppModule } from '../../app.module';
import { DiscordHelper } from '../../discord/helpers/discord.helper';
import { DiscordHarvestJobService } from '../../discord/services/discord-harvest-job.service';
import { LearnerService } from '../../learner/learner.service';
import { CommunityService } from '../../community/community.service';
import { ChannelType, TextChannel } from 'discord.js';
import { Long } from 'bson';

async function runDaemon() {
	const app = await NestFactory.createApplicationContext(AppModule);
	const discord = app.get(DiscordHelper);
	const jobService = app.get(DiscordHarvestJobService);
	const messageService = app.get(DiscordMessageService);
	const learnerService = app.get(LearnerService);
	const communityService = app.get(CommunityService);

	await discord.connect();
	console.log('[Discord Daemon] Started');

	while (true) {
		const job = await jobService.getNextPendingJob();
		try {
			if (job) {
				console.log(`[Discord Daemon] Start new Job ${job._id}`);

				// Récupérer la communauté associée au serveur Discord
				const community =
					await communityService.findOneByDiscordServerId(
						job.serverId.toString(),
					);
				if (!community) {
					console.warn(
						`[Discord Daemon] Community not found for server ${job.serverId}`,
					);
					await jobService.updateJobStatus(
						job._id.toString(),
						'failed',
						{ error: 'Community not found' },
					);
					continue;
				}

				// Récupérer les utilisateurs qui ont accepté les termes
				const acceptedUserIds =
					await learnerService.getAcceptedUsersDiscordIds(
						community.id,
					);

				console.log(
					`[Discord Daemon] Found ${acceptedUserIds.size} users who accepted terms for community ${community.id}`,
				);

				const guild = await discord.getGuild(job.serverId.toString());
				const channels: TextChannel[] = [];

				for (const channelId of job.channels) {
					try {
						const ch = await guild.channels.fetch(
							channelId.toString(),
						);
						if (ch && ch.type === ChannelType.GuildText) {
							channels.push(ch as TextChannel);
						}
					} catch (err: any) {
						console.warn(
							`[Discord Daemon] Could not fetch channel ${channelId}`,
							err.message,
						);
					}
				}

				const allMessages: any[] = [];
				for (const ch of channels.values()) {
					const history = await discord.fetchMessages(
						ch,
						job.after,
						job.before,
					);
					allMessages.push(...history);
				}

				// Utiliser la nouvelle méthode qui vérifie les termes d'utilisation
				const inserted = await messageService.saveIfNewWithTermsCheck(
					allMessages,
					acceptedUserIds,
				);
				await jobService.updateJobStatus(job._id.toString(), 'done', {
					inserted,
				});
				console.log(
					`[Discord Daemon] Job ${job._id} done. ${inserted} messages inserted.`,
				);
			}
		} catch (e: any) {
			console.error(`[Discord Daemon] Job failed: ${e.message}`);
			if (job) {
				await jobService.updateJobStatus(job._id.toString(), 'failed', {
					error: e.message,
				});
			}
		}

		await new Promise((resolve) => setTimeout(resolve, 3000));
	}
}

runDaemon();
