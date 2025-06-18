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
import { DiscordProposalService } from './discord-proposal.service';
import { DiscordServerService } from '../../discord-server/discord-server.service';

@Injectable()
export class DiscordInteractionService implements OnModuleInit {
	private readonly logger = new Logger(DiscordInteractionService.name);

	constructor(
		private readonly discordClientService: DiscordClientService,
		private readonly discordProposalService: DiscordProposalService,
		private readonly discordServerService: DiscordServerService,
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
					if (
						interaction.isButton() &&
						interaction.customId === 'proposer_idee'
					) {
						await this.discordProposalService.handleProposerIdee(
							interaction,
						);
					} else if (
						interaction.isModalSubmit() &&
						interaction.customId === 'formulaire_idee_sujet'
					) {
						await this.discordProposalService.handleModalSujet(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_format|')
					) {
						await this.discordProposalService.handleSelectFormat(
							interaction,
						);
					} else if (
						interaction.isStringSelectMenu() &&
						interaction.customId.startsWith('choix_contributeur|')
					) {
						await this.discordProposalService.handleSelectContributeur(
							interaction,
						);
					}
				} catch (e) {
					this.logger.error(
						"Erreur lors du traitement de l'interaction Discord",
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
								'Impossible de fetch la réaction partielle',
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
								"Impossible de fetch l'utilisateur partiel",
								e,
							);
							return;
						}
					}
					await this.discordProposalService.handleMessageReactionAdd(
						reaction as MessageReaction,
						user as User,
					);
				} catch (e) {
					this.logger.error(
						'Erreur lors du traitement de la réaction Discord',
						e,
					);
				}
			},
		);

		client.on(Events.GuildCreate, async (guild) => {
			try {
				this.logger.log(
					`[DEBUG] GuildCreate reçu pour ${guild.name} (${guild.id})`,
				);
				// Log état du cache rôles
				this.logger.log(
					`[DEBUG] Rôles sur le serveur : ` +
						guild.roles.cache
							.map((r) => `${r.name} (${r.id})`)
							.join(', '),
				);
				// Log état du cache salons
				this.logger.log(
					`[DEBUG] Salons sur le serveur : ` +
						guild.channels.cache
							.map((c) => `${c.name} (${c.id}) [type=${c.type}]`)
							.join(', '),
				);

				let discordServer = await this.discordServerService.findOne(
					guild.id,
				);
				this.logger.log(
					`[DEBUG] DiscordServer en base : ${JSON.stringify(discordServer)}`,
				);

				// --- Gestion du rôle d'authentification ---
				let role: any = null;
				let roleWasMissing = false;
				if (discordServer?.authRoleId) {
					role = guild.roles.cache.get(discordServer.authRoleId);
					if (!role) {
						this.logger.warn(
							`[DUPLICATION] L'id du rôle (${discordServer.authRoleId}) est en base mais n'existe plus sur Discord. On va le recréer.`,
						);
						role = await guild.roles.create({
							name: 'Snowledge Authenticated',
							color: 'Blue',
							mentionable: true,
							permissions: [],
						});
						this.logger.warn(
							`[REPAIR] Rôle d'authentification recréé avec id ${role.id} sur ${guild.name}`,
						);
						roleWasMissing = true;
					}
				}
				if (!role) {
					role = guild.roles.cache.find(
						(r) => r.name === 'Snowledge Authenticated',
					);
					if (role) {
						this.logger.warn(
							`[DUPLICATION] Un rôle 'Snowledge Authenticated' existe déjà avec id ${role.id} mais il n'était pas référencé en base.`,
						);
					}
				}
				if (!role) {
					role = await guild.roles.create({
						name: 'Snowledge Authenticated',
						color: 'Blue',
						mentionable: true,
						permissions: [],
					});
					this.logger.log(
						`Rôle 'Snowledge Authenticated' créé avec id ${role.id} sur le serveur ${guild.name}`,
					);
					roleWasMissing = true;
				}
				if (roleWasMissing || discordServer?.authRoleId !== role.id) {
					this.logger.log(
						`[UPDATE] Mise à jour de l'id du rôle en base : ${role.id}`,
					);
					await this.discordServerService.update(guild.id, {
						authRoleId: role.id,
					});
				}

				// --- Gestion du salon d'authentification ---
				let channel: any = null;
				let channelWasMissing = false;
				if (discordServer?.authChannelId) {
					channel = guild.channels.cache.get(
						discordServer.authChannelId,
					);
					if (!channel) {
						this.logger.warn(
							`[DUPLICATION] L'id du salon (${discordServer.authChannelId}) est en base mais n'existe plus sur Discord. On va le recréer.`,
						);
						channel = await guild.channels.create({
							name: 'validation-cgu-snowledge',
							type: 0, // GUILD_TEXT
							topic: 'Salon pour valider les CGU et autoriser Snowledge',
							permissionOverwrites: [
								{
									id: guild.roles.everyone.id,
									allow: ['ViewChannel'],
									deny: ['SendMessages'],
								},
								{
									id: role.id,
									deny: ['ViewChannel'],
								},
								{
									id: client.user.id,
									allow: ['ViewChannel', 'SendMessages'],
								},
							],
						});
						this.logger.warn(
							`[REPAIR] Salon d'authentification recréé avec id ${channel.id} sur ${guild.name}`,
						);
						channelWasMissing = true;
					}
				}
				if (!channel) {
					channel = guild.channels.cache.find(
						(c) =>
							c.name === 'validation-cgu-snowledge' &&
							c.type === 0,
					);
					if (channel) {
						this.logger.warn(
							`[DUPLICATION] Un salon 'validation-cgu-snowledge' existe déjà avec id ${channel.id} mais il n'était pas référencé en base.`,
						);
					}
				}
				if (!channel) {
					if (!role) {
						throw new Error(
							"Le rôle d'authentification n'existe pas sur ce serveur !",
						);
					}
					channel = await guild.channels.create({
						name: 'validation-cgu-snowledge',
						type: 0, // GUILD_TEXT
						topic: 'Salon pour valider les CGU et autoriser Snowledge',
						permissionOverwrites: [
							{
								id: guild.roles.everyone.id,
								allow: ['ViewChannel'],
								deny: ['SendMessages'],
							},
							{
								id: role.id,
								deny: ['ViewChannel'],
							},
							{
								id: client.user.id,
								allow: ['ViewChannel', 'SendMessages'],
							},
						],
					});
					this.logger.log(
						`Salon 'validation-cgu-snowledge' créé avec id ${channel.id} sur le serveur ${guild.name}`,
					);
					channelWasMissing = true;
				}
				if (
					channelWasMissing ||
					discordServer?.authChannelId !== channel.id
				) {
					this.logger.log(
						`[UPDATE] Mise à jour de l'id du salon en base : ${channel.id}`,
					);
					await this.discordServerService.update(guild.id, {
						authChannelId: channel.id,
					});
				}

				// Génération dynamique de l'URL OAuth2
				const params = new URLSearchParams({
					client_id: process.env.DISCORD_CLIENT_ID,
					redirect_uri: `${process.env.BACK_URL}/discord-bot/link`,
					response_type: 'code',
					scope: 'identify email',
					prompt: 'consent',
					state: guild.id,
				});
				const oauthUrl = `https://discord.com/oauth2/authorize?${params.toString()}`;
				const {
					ActionRowBuilder,
					ButtonBuilder,
					ButtonStyle,
				} = require('discord.js');
				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel('Autoriser Snowledge')
						.setStyle(ButtonStyle.Link)
						.setURL(oauthUrl),
				);
				const message = await channel.send({
					content: `Afin de pouvoir accéder aux fonctionnalités de Snowledge, vous devez accepter les conditions suivantes et autoriser la connexion à votre compte Discord.`,
					components: [row],
				});
				await message.pin();
				this.logger.log(
					`Message d'autorisation envoyé et épinglé dans 'validation-cgu-snowledge' sur ${guild.name}`,
				);
			} catch (e) {
				this.logger.error(
					`Erreur lors de la création du rôle, du salon ou de l'envoi du message sur le serveur ${guild.name}`,
					e,
				);
			}
		});
	}
}
