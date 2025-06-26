import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
	Events,
	Interaction,
	MessageReaction,
	PartialMessageReaction,
	User,
	PartialUser,
	GuildMember,
	EmbedBuilder,
} from 'discord.js';
import { DiscordClientService } from './discord-client.service';
import { DiscordLogicProvider } from '../providers/discord-logic.provider';
import { DiscordProposalProvider } from '../providers/discord-proposal.provider';
import { UserService } from 'src/user/user.service';

@Injectable()
export class DiscordInteractionService implements OnModuleInit {
	private readonly logger = new Logger(DiscordInteractionService.name);

	constructor(
		private readonly discordClientService: DiscordClientService,
		private readonly discordProposalProvider: DiscordProposalProvider,
		private readonly discordLogicProvider: DiscordLogicProvider,
		private readonly userService: UserService,
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
						console.log(
							`Commande reçue: ${interaction.commandName}`,
						);

						try {
							if (interaction.commandName === 'mynft') {
								await interaction.deferReply({
									flags: 'Ephemeral',
								});

								console.log('Exécution /mynft...');

								const member =
									interaction.member as GuildMember;
								if (
									!member.roles.cache.some(
										(r) =>
											r.name ===
											'Snowledge Authenticated',
									)
								) {
									await interaction.editReply({
										content:
											'Vous devez avoir le rôle "Snowledge Authenticated" pour utiliser cette commande.',
									});
									return;
								}

								const user =
									await this.userService.findOneByDiscordId(
										interaction.user.id,
									);

								if (!user || !user.nftId) {
									await interaction.editReply({
										content:
											"Nous n'avons pas trouvé de NFT associé à votre compte. Avez-vous bien lié votre compte Discord à la plateforme ?",
									});
									return;
								}

								const embed = new EmbedBuilder()
									.setColor('#0099ff')
									.setTitle(
										"🖼️ Votre NFT d'Identité Snowledge",
									)
									.setDescription(
										`Voici votre NFT personnel. Il représente votre identité unique au sein de l'écosystème Snowledge.`,
									)
									.addFields({
										name: "Consulter sur l'explorateur",
										value: `[Cliquez ici pour voir votre NFT](https://test.xrplexplorer.com/en/nft/${user.nftId})`,
									})
									.setThumbnail(
										interaction.user.displayAvatarURL(),
									)
									.setTimestamp()
									.setFooter({
										text: 'Snowledge NFT System',
										iconURL:
											'https://test-image-snowledge.s3.eu-west-par.io.cloud.ovh.net/logo/logo.png',
									});

								await interaction.editReply({
									embeds: [embed],
								});

								console.log('/mynft exécutée avec succès');
							}
						} catch (e) {
							this.logger.error(
								'Error processing Discord interaction',
								e,
							);
						}
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
