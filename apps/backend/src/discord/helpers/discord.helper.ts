// src/discord/services/discord.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, TextChannel, ChannelType, Partials } from 'discord.js';

@Injectable()
export class DiscordHelper {
	private readonly logger = new Logger(DiscordHelper.name);
	
	private client: Client;

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
			],
			partials: [Partials.Channel]
		});
	}

	async connect(): Promise<void> {
		await this.client.login(process.env.DISCORD_BOT_TOKEN);
		return new Promise((resolve) => {
		this.client.once('ready', () => {
			console.log(`[Discord] Logged in as ${this.client.user?.tag}`);
			resolve();
		});
		});
	}

  async getGuild(guildId: string) {
    return this.client.guilds.fetch(guildId);
  }

  async fetchMessages(channel: TextChannel, after?: Date, before?: Date): Promise<any[]> {
    const options = {
        limit: 100,
        ...(after && { after: this.dateToSnowflake(after) }),
        ...(before && { before: this.dateToSnowflake(before) }),
    };
	this.logger.verbose(JSON.stringify(options))
    const allMessages: any[] = [];
    let lastId: string | undefined;

    while (true) {
      if (lastId) options.after = lastId;
      const batch = await channel.messages.fetch(options);
      if (batch.size === 0) break;

      const batchSorted = Array.from(batch.values()).sort((a, b) => a.createdTimestamp - b.createdTimestamp);
      allMessages.push(...batchSorted);
      lastId = batchSorted[batchSorted.length - 1].id;

      if (batch.size < 100) break;
    }

    return allMessages.map((msg) => ({
      id: msg.id,
      channel_id: msg.channel.id,
      author_name: msg.member?.displayName || msg.author.username,
      author_user_id: msg.author.id,
      content: msg.cleanContent,
      created_at_by_discord: msg.createdAt,
      fetched_at: new Date(),
    }));
  }
   dateToSnowflake(date: Date): string {

		return ((BigInt(date.valueOf()) - BigInt(1420070400000)) << BigInt(22)).toString();
    }
}
