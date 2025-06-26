import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	Client,
	GatewayIntentBits,
	Partials,
	Events,
	REST,
	Routes,
	SlashCommandBuilder,
} from 'discord.js';

@Injectable()
export class DiscordClientService implements OnModuleInit {
	private readonly logger = new Logger(DiscordClientService.name);
	private client: Client;
	private rest: REST;

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

		this.rest = new REST({ version: '10' }).setToken(
			process.env.DISCORD_BOT_TOKEN,
		);

		this.client.on(Events.Warn, (info) => this.logger.warn(info));
		this.client.on(Events.Error, (err) => this.logger.error(err));
		this.client.on(Events.ShardDisconnect, () =>
			this.logger.warn('Disconnected from Discord.'),
		);
		this.client.on(Events.ShardReconnecting, () =>
			this.logger.log('Reconnecting to Discord...'),
		);

		// Événement quand le bot rejoint un nouveau serveur
		this.client.on(Events.GuildCreate, async (guild) => {
			this.logger.log(
				`Bot ajouté au serveur: ${guild.name} (${guild.id})`,
			);
			await this.registerCommandsForGuild(guild.id);
		});
	}

	private async registerCommandsForGuild(guildId: string) {
		try {
			const commands = [
				new SlashCommandBuilder()
					.setName('mynft')
					.setDescription("Affiche votre NFT d'identité Snowledge."),
			].map((command) => command.toJSON());

			await this.rest.put(
				Routes.applicationGuildCommands(
					process.env.DISCORD_CLIENT_ID,
					guildId,
				),
				{ body: commands },
			);

			this.logger.log(
				`Commandes enregistrées pour le serveur ${guildId}`,
			);
		} catch (error) {
			this.logger.error(
				`Erreur lors de l'enregistrement des commandes pour ${guildId}:`,
				error,
			);
		}
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
