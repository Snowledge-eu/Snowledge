import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Partials, Events } from 'discord.js';

@Injectable()
export class DiscordClientService implements OnModuleInit {
	private readonly logger = new Logger(DiscordClientService.name);
	private client: Client;

	constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildMembers,
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
		});

		this.client.on(Events.Warn, (info) => this.logger.warn(info));
		this.client.on(Events.Error, (err) => this.logger.error(err));
		this.client.on(Events.ShardDisconnect, () =>
			this.logger.warn('Disconnected from Discord.'),
		);
		this.client.on(Events.ShardReconnecting, () =>
			this.logger.log('Reconnecting to Discord...'),
		);
	}

	async onModuleInit() {
		await this.login();
	}

	async login() {
		try {
			this.client.once(Events.ClientReady, () => {
				this.logger.log(`✅ Connected as ${this.client.user?.tag}`);
			});
			const token = process.env.DISCORD_BOT_TOKEN;
			if (!token) {
				throw new Error(
					'DISCORD_BOT_TOKEN is not defined in environment variables!',
				);
			}
			await this.client.login(token);
		} catch (error) {
			this.logger.error('Failed to log in to Discord', error);
			process.exit(1);
		}
	}

	getClient(): Client {
		return this.client;
	}
}
