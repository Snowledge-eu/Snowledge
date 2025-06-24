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
import { ProposalService } from 'src/proposal/proposal.service';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmbedBuilder, TextChannel } from 'discord.js';

@Injectable()
export class DiscordInteractionService implements OnModuleInit {
	private readonly logger = new Logger(DiscordInteractionService.name);

	constructor(
		private readonly discordClientService: DiscordClientService,
		private readonly discordProposalService: DiscordProposalService,
		private readonly discordServerService: DiscordServerService,
		private readonly proposalService: ProposalService,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		private readonly dataSource: DataSource,
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
					await this.handleMessageReactionAdd(
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

	async handleMessageReactionAdd(reaction: MessageReaction, user: User) {
		if (user.bot) return;

		const discordServer = await this.communityRepository.manager
			.getRepository(Community)
			.createQueryBuilder('community')
			.leftJoinAndSelect('community.discordServer', 'discordServer')
			.where('discordServer.guildId = :guildId', {
				guildId: reaction.message.guild.id,
			})
			.getOne();

		if (!discordServer) return;

		const voteChannelId = discordServer.discordServer?.voteChannelId;
		if (reaction.message.channel.id !== voteChannelId) return;

		try {
			const isProposalMessage =
				reaction.message.embeds.length > 0 &&
				reaction.message.embeds[0].title?.startsWith(
					'📢 Nouvelle idée',
				);
			if (!isProposalMessage) return;

			await this.dataSource.transaction(
				async (transactionalEntityManager) => {
					const proposal = await transactionalEntityManager
						.getRepository(Proposal)
						.findOne({
							where: { messageId: reaction.message.id },
						});

					if (!proposal || proposal.status !== 'in_progress') return;

					let voteType: 'subject' | 'format' | null = null;
					let voteValue: 'for' | 'against' | null = null;

					if (reaction.emoji.name === '✅') voteType = 'subject';
					if (reaction.emoji.name === '❌') voteType = 'subject';
					if (reaction.emoji.name === '👍') voteType = 'format';
					if (reaction.emoji.name === '👎') voteType = 'format';
					if (['✅', '👍'].includes(reaction.emoji.name))
						voteValue = 'for';
					if (['❌', '👎'].includes(reaction.emoji.name))
						voteValue = 'against';

					if (!voteType || !voteValue) return;

					const voter = await transactionalEntityManager
						.getRepository(UserEntity)
						.findOne({ where: { discordId: user.id } });
					if (!voter) return;

					const existingVote = await transactionalEntityManager
						.getRepository(Vote)
						.findOne({
							where: {
								proposal: { id: proposal.id },
								user: { id: voter.id },
							},
						});

					if (existingVote) {
						const payload: Partial<Vote> = {};
						if (voteType === 'subject') payload.choice = voteValue;
						if (voteType === 'format')
							payload.formatChoice = voteValue;
						await transactionalEntityManager
							.getRepository(Vote)
							.update(existingVote.id, payload);
					} else {
						const newVote = transactionalEntityManager
							.getRepository(Vote)
							.create({
								proposal: { id: proposal.id },
								user: { id: voter.id },
								choice:
									voteType === 'subject'
										? voteValue
										: undefined,
								formatChoice:
									voteType === 'format'
										? voteValue
										: undefined,
							});
						await transactionalEntityManager.save(newVote);
					}
				},
			);

			const proposal = await this.dataSource
				.getRepository(Proposal)
				.findOne({
					where: { messageId: reaction.message.id },
					relations: [
						'community',
						'votes',
						'submitter',
						'community.learners',
					],
				});

			if (!proposal) return;

			const updatedProposal =
				await this.proposalService.updateProposalStatus(proposal);

			const channel = reaction.message.channel as TextChannel;
			const message = await channel.messages.fetch(reaction.message.id);

			if (updatedProposal.status === 'in_progress') {
				const updatedEmbed =
					await this.createProposalEmbed(updatedProposal);
				await message.edit({ embeds: [updatedEmbed] });
			} else {
				const resultEmbed =
					this.createProposalResultEmbed(updatedProposal);
				await message.edit({ embeds: [resultEmbed], components: [] });

				const resultsChannelId =
					discordServer.discordServer?.resultChannelId;
				if (resultsChannelId) {
					const resultsChannel = (await channel.guild.channels.fetch(
						resultsChannelId,
					)) as TextChannel;
					if (resultsChannel) {
						await resultsChannel.send({ embeds: [resultEmbed] });
					}
				}
			}
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}

	private async createProposalEmbed(
		proposal: Proposal,
	): Promise<EmbedBuilder> {
		const yesVotes = proposal.votes.filter(
			(v) => v.choice === 'for',
		).length;
		const noVotes = proposal.votes.filter(
			(v) => v.choice === 'against',
		).length;
		const yesFormatVotes = proposal.votes.filter(
			(v) => v.formatChoice === 'for',
		).length;
		const noFormatVotes = proposal.votes.filter(
			(v) => v.formatChoice === 'against',
		).length;
		const totalVoters = proposal.votes.length;
		const quorum = proposal.quorum.required;

		const embed = new EmbedBuilder()
			.setColor('#0099ff')
			.setTitle(
				`📢 Nouvelle idée proposée par ${proposal.submitter.firstname}`,
			)
			.setDescription(
				`**Sujet :** ${proposal.title}\n\n> ${proposal.description}`,
			)
			.addFields(
				{
					name: 'Format proposé',
					value: proposal.format,
					inline: true,
				},
				{
					name: 'Contributeur potentiel',
					value: proposal.isContributor ? 'Oui' : 'Non',
					inline: true,
				},
				{
					name: 'Fin du vote',
					value: `<t:${Math.floor(proposal.deadline.getTime() / 1000)}:R>`,
					inline: true,
				},
				{
					name: `Votes sur le sujet (${totalVoters}/${quorum})`,
					value: `✅ Pour : ${yesVotes}\n❌ Contre : ${noVotes}`,
					inline: true,
				},
				{
					name: 'Votes sur le format',
					value: `👍 Pour : ${yesFormatVotes}\n👎 Contre : ${noFormatVotes}`,
					inline: true,
				},
			)
			.setFooter({
				text: 'Réagissez pour voter !',
			});

		return embed;
	}

	private createProposalResultEmbed(proposal: Proposal): EmbedBuilder {
		const statusIcon = proposal.status === 'accepted' ? '✅' : '❌';
		const statusText =
			proposal.status === 'accepted' ? 'Acceptée' : 'Rejetée';
		const color = proposal.status === 'accepted' ? '#2ECC71' : '#E74C3C';

		let formatResult = proposal.format;
		if (
			proposal.status === 'accepted' &&
			proposal.format === 'toBeDefined'
		) {
			formatResult = 'À redéfinir (format initial refusé)';
		}

		const embed = new EmbedBuilder()
			.setColor(color)
			.setTitle(`${statusIcon} Proposition ${statusText}`)
			.setDescription(`**Sujet :** ${proposal.title}`)
			.addFields({ name: 'Format final', value: formatResult });

		return embed;
	}
}
