import { Injectable, Logger } from '@nestjs/common';
import { TextChannel } from 'discord.js';
import { DiscordClientService } from './discord-client.service';
import type { Community } from 'src/community/entities/community.entity';
import { EmbedBuilder } from 'discord.js';

@Injectable()
export class DiscordProposalService {
	private readonly logger = new Logger(DiscordProposalService.name);

	constructor(private readonly discordClientService: DiscordClientService) {}

	async sendCreationNotification(
		embed: EmbedBuilder,
		community: Community,
		formatIsDefined: boolean,
	): Promise<{ messageId: string } | null> {
		const client = this.discordClientService.getClient();
		const guildId = community.discordServer.guildId;
		const voteChannelId = community.discordServer.voteChannelId;

		if (!voteChannelId) {
			this.logger.error(
				`Vote channel not configured for guild ${guildId}`,
			);
			return null;
		}

		const channel = (await client.channels.fetch(
			voteChannelId,
		)) as TextChannel;

		if (!channel) {
			this.logger.error(
				`Could not find channel with id ${voteChannelId}`,
			);
			return null;
		}

		const message = await channel.send({ embeds: [embed] });
		await message.react('✅');
		await message.react('❌');
		if (formatIsDefined) {
			await message.react('👍');
			await message.react('👎');
		}

		return { messageId: message.id };
	}
}
