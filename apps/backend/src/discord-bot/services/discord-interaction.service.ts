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
					await this.discordProposalService.handleMessageReactionAdd(
						reaction as MessageReaction,
						user as User,
					);
				} catch (e) {
					this.logger.error('Error processing Discord reaction', e);
				}
			},
		);

		client.on(Events.GuildCreate, async (guild) => {
			try {
				this.logger.log(
					`[DEBUG] GuildCreate received for ${guild.name} (${guild.id})`,
				);
				// Log role cache state
				this.logger.log(
					`[DEBUG] Roles on server: ` +
						guild.roles.cache
							.map((r) => `${r.name} (${r.id})`)
							.join(', '),
				);
				// Log channel cache state
				this.logger.log(
					`[DEBUG] Channels on server: ` +
						guild.channels.cache
							.map((c) => `${c.name} (${c.id}) [type=${c.type}]`)
							.join(', '),
				);

				let discordServer = await this.discordServerService.findOne(
					guild.id,
				);
				this.logger.log(
					`[DEBUG] DiscordServer in DB: ${JSON.stringify(discordServer)}`,
				);

				// --- Authentication role management ---
				let role: any = null;
				let roleWasMissing = false;
				if (discordServer?.authRoleId) {
					role = guild.roles.cache.get(discordServer.authRoleId);
					if (!role) {
						this.logger.warn(
							`[DUPLICATION] Role ID (${discordServer.authRoleId}) is in the DB but no longer exists on Discord. Recreating it.`,
						);
						role = await guild.roles.create({
							name: 'Snowledge Authenticated',
							color: 'Blue',
							mentionable: true,
							permissions: [],
						});
						this.logger.warn(
							`[REPAIR] Authentication role recreated with ID ${role.id} on ${guild.name}`,
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
							`[DUPLICATION] A 'Snowledge Authenticated' role already exists with ID ${role.id} but it was not referenced in the DB.`,
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
						`'Snowledge Authenticated' role created with ID ${role.id} on server ${guild.name}`,
					);
					roleWasMissing = true;
				}
				if (roleWasMissing || discordServer?.authRoleId !== role.id) {
					this.logger.log(
						`[UPDATE] Updating role ID in DB: ${role.id}`,
					);
					await this.discordServerService.update(guild.id, {
						authRoleId: role.id,
					});
				}

				// --- Authentication channel management ---
				let channel: any = null;
				let channelWasMissing = false;
				if (discordServer?.authChannelId) {
					channel = guild.channels.cache.get(
						discordServer.authChannelId,
					);
					if (!channel) {
						this.logger.warn(
							`[DUPLICATION] Channel ID (${discordServer.authChannelId}) is in the DB but no longer exists on Discord. Recreating it.`,
						);
						channel = await guild.channels.create({
							name: 'snowledge-tos-validation',
							type: 0, // GUILD_TEXT
							topic: 'Channel to validate TOS and authorize Snowledge',
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
							`[REPAIR] Authentication channel recreated with ID ${channel.id} on ${guild.name}`,
						);
						channelWasMissing = true;
					}
				}
				if (!channel) {
					channel = guild.channels.cache.find(
						(c) =>
							c.name === 'snowledge-tos-validation' &&
							c.type === 0,
					);
					if (channel) {
						this.logger.warn(
							`[DUPLICATION] A 'snowledge-tos-validation' channel already exists with ID ${channel.id} but was not referenced in the DB.`,
						);
					}
				}
				if (!channel) {
					if (!role) {
						throw new Error(
							'The authentication role does not exist on this server!',
						);
					}
					channel = await guild.channels.create({
						name: 'snowledge-tos-validation',
						type: 0, // GUILD_TEXT
						topic: 'Channel to validate TOS and authorize Snowledge',
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
						`'snowledge-tos-validation' channel created with ID ${channel.id} on server ${guild.name}`,
					);
					channelWasMissing = true;
				}
				if (
					channelWasMissing ||
					discordServer?.authChannelId !== channel.id
				) {
					this.logger.log(
						`[UPDATE] Updating channel ID in DB: ${channel.id}`,
					);
					await this.discordServerService.update(guild.id, {
						authChannelId: channel.id,
					});
				}

				// Dynamic generation of OAuth2 URL
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
						.setLabel('Authorize Snowledge')
						.setStyle(ButtonStyle.Link)
						.setURL(oauthUrl),
				);
				const message = await channel.send({
					content: `To access Snowledge features, you must accept the following conditions and authorize the connection to your Discord account.`,
					components: [row],
				});
				await message.pin();
				this.logger.log(
					`Authorization message sent and pinned in 'snowledge-tos-validation' on ${guild.name}`,
				);
			} catch (e) {
				this.logger.error(
					`Error creating role, channel, or sending message on server ${guild.name}`,
					e,
				);
			}
		});
	}
}
