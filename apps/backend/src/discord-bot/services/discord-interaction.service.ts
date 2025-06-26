import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	Events,
	Interaction,
	MessageReaction,
	PartialMessageReaction,
	User,
	PartialUser,
} from 'discord.js';
import { DiscordClientService } from './discord-client.service';
import { DiscordLogicProvider } from '../providers/discord-logic.provider';
import { DiscordProposalProvider } from '../providers/discord-proposal.provider';
import { DiscordCommandService } from './discord-command.service';

@Injectable()
export class DiscordInteractionService implements OnModuleInit {
	private readonly logger = new Logger(DiscordInteractionService.name);

	constructor(
		private readonly discordClientService: DiscordClientService,
		private readonly discordProposalProvider: DiscordProposalProvider,
		private readonly discordLogicProvider: DiscordLogicProvider,
		private readonly discordCommandService: DiscordCommandService,
	) {}

	onModuleInit() {
		this.registerListeners();
	}

	private registerListeners() {
		const client = this.discordClientService.getClient();
		client.on(
			Events.InteractionCreate,
			async (interaction: Interaction) => {
				try {
					if (interaction.isChatInputCommand()) {
						this.logger.log(
							`Commande reçue: ${interaction.commandName}`,
						);
						await this.discordCommandService.executeCommand(
							interaction,
						);
					}

					if (
						interaction.isButton() &&
						interaction.customId === 'proposer_idee'
					) {
						await this.discordProposalProvider.handleProposerIdee(
							interaction,
						);
					} else if (
						interaction.isModalSubmit() &&
						interaction.customId === 'formulaire_idee_sujet'
					) {
						await this.discordProposalProvider.handleModalSujet(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_format|')
					) {
						await this.discordProposalProvider.handleSelectFormat(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_contributeur|')
					) {
						await this.discordProposalProvider.handleSelectContributeur(
							interaction,
						);
					}
				} catch (e) {
					this.logger.error(
						'Error processing Discord interaction',
						e,
					);
				}
			},
		);
		client.on(
			Events.MessageReactionAdd,
			async (
				reaction: MessageReaction | PartialMessageReaction,
				user: User | PartialUser,
			) => {
				try {
					if (reaction.partial) {
						try {
							await reaction.fetch();
						} catch (e) {
							this.logger.error(
								'Could not fetch partial reaction',
								e,
							);
							return;
						}
					}
					if (user.partial) {
						try {
							await user.fetch();
						} catch (e) {
							this.logger.error(
								'Could not fetch partial user',
								e,
							);
							return;
						}
					}
					await this.discordLogicProvider.handleMessageReactionAdd(
						reaction as MessageReaction,
						user as User,
					);
				} catch (e) {
					this.logger.error('Error processing Discord reaction', e);
				}
			},
		);

		client.on(Events.GuildCreate, async (guild) => {
			await this.discordLogicProvider.handleGuildCreate(guild);
		});
	}
}
