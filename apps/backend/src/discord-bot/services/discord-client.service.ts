import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	Client,
	GatewayIntentBits,
	Partials,
	Events,
	REST,
	Routes,
} from 'discord.js';
import { DiscordCommandService } from './discord-command.service';

@Injectable()
export class DiscordClientService implements OnModuleInit {
	private readonly logger = new Logger(DiscordClientService.name);
	private client: Client;
	private rest = new REST({ version: '10' }).setToken(
		process.env.DISCORD_BOT_TOKEN,
	);

	constructor(private readonly discordCommandService: DiscordCommandService) {
		this.registerCommands();
		this.initializeClient();
	}

	private async registerCommands() {
		this.logger.log('Registering global commands...');
		const commands = this.discordCommandService.getCommandsData();
		await this.rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{ body: commands },
		);
		this.logger.log('Global commands registered');
	}

	private async initializeClient() {
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

		// Événement quand le bot rejoint un nouveau serveur
		this.client.on(Events.GuildCreate, async (guild) => {
			this.logger.log(
				`Bot ajouté au serveur: ${guild.name} (${guild.id})`,
			);

			// TODO: Supprimer plus tard si y'a pas de problème
			// Enregistrer automatiquement les commandes pour le nouveau serveur
			// try {
			// 	this.logger.log(
			// 		`Registering commands for guild: ${guild.name} (${guild.id})`,
			// 	);
			// 	await this.rest.put(
			// 		Routes.applicationGuildCommands(
			// 			process.env.DISCORD_CLIENT_ID,
			// 			guild.id,
			// 		),
			// 		{ body: this.discordCommandService.getCommandsData() },
			// 	);
			// 	this.logger.log(
			// 		`Commandes enregistrées pour le serveur: ${guild.name}`,
			// 	);
			// } catch (error) {
			// 	this.logger.error(
			// 		`Erreur lors de l'enregistrement des commandes pour ${guild.name}`,
			// 		error,
			// 	);
			// }
		});
	}

	async onModuleInit() {
		await this.login();
	}

	async login() {
		try {
			// 1. On prépare l'écouteur d'événement AVANT la connexion
			this.client.once(Events.ClientReady, () => {
				this.logger.log(`✅ Connected as ${this.client.user?.tag}`);
			});

			// 2. On vérifie le token
			const token = process.env.DISCORD_BOT_TOKEN;
			if (!token) {
				throw new Error(
					'DISCORD_BOT_TOKEN is not defined in environment variables!',
				);
			}

			// 3. On lance la connexion
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
