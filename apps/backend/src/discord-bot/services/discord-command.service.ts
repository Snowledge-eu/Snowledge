import { Injectable, Logger } from '@nestjs/common';
import { Collection, ChatInputCommandInteraction } from 'discord.js';
import { MyNftCommand } from '../commands/mynft.command';
import { DiscordClientService } from './discord-client.service';

@Injectable()
export class DiscordCommandService {
	private readonly logger = new Logger(DiscordCommandService.name);
	private commands = new Collection<string, any>();

	constructor(private readonly myNftCommand: MyNftCommand) {
		this.loadCommands();
	}

	private loadCommands() {
		// Enregistrer toutes les commandes
		const commands = [this.myNftCommand];

		for (const command of commands) {
			this.commands.set(command.data.name, command);
		}

		this.logger.log(`Loaded ${this.commands.size} commands`);
	}

	/**
	 * Retourne tous les data des commandes pour l'enregistrement
	 */
	getCommandsData() {
		return this.commands.map((command) => command.data.toJSON());
	}

	/**
	 * Exécute une commande
	 */
	async executeCommand(interaction: ChatInputCommandInteraction) {
		const command = this.commands.get(interaction.commandName);

		if (!command) {
			this.logger.warn(
				`No command matching ${interaction.commandName} was found.`,
			);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			this.logger.error(
				`Error executing command ${interaction.commandName}:`,
				error,
			);

			const reply = {
				content:
					"Une erreur est survenue lors de l'exécution de cette commande !",
				ephemeral: true,
			};

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(reply);
			} else {
				await interaction.reply(reply);
			}
		}
	}

	// --- PATCH TEMPORAIRE: Injection manuelle DiscordClientService pour /myid ---
	initDiscordClientService(discordClientService: DiscordClientService) {
		this.myNftCommand.setDiscordClientService(discordClientService);
	}
	// --- FIN PATCH TEMPORAIRE ---
}
