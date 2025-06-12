import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import {
	Client,
	GatewayIntentBits,
	Partials,
	Events,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
	ChannelType,
	MessageReaction,
	User,
	Interaction,
} from 'discord.js';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';

@Injectable()
export class DiscordBotService implements OnModuleInit {
	constructor(
		@InjectRepository(DiscordServer)
		private discordServerRepository: Repository<DiscordServer>,
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	private readonly logger = new Logger(DiscordBotService.name);
	private client: Client;
	// Nombre de votes nécessaires pour valider ou rejeter une proposition
	private readonly VOTES_NECESSAIRES = 1;
	private pendingProposals = new Map<
		string,
		{ sujet: string; description: string; format?: string }
	>();

	// Méthode appelée automatiquement par NestJS au démarrage du module
	onModuleInit() {
		this.startBot();
	}

	// Initialise et démarre le bot Discord
	private startBot() {
		// Création du client Discord avec les intents nécessaires
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
			],
			partials: [Partials.Message, Partials.Channel, Partials.Reaction],
		});

		// Log quand le bot est prêt
		this.client.once(Events.ClientReady, () => {
			this.logger.log(`✅ Connected as ${this.client.user?.tag}`);
		});

		// Gestion des interactions (slash commands, boutons, modals, select menus)
		this.client.on(
			Events.InteractionCreate,
			async (interaction: Interaction) => {
				if (
					interaction.isButton() &&
					interaction.customId === 'proposer_idee'
				) {
					await this.handleProposerIdee(interaction);
				} else if (
					interaction.isModalSubmit() &&
					interaction.customId === 'formulaire_idee_sujet'
				) {
					await this.handleModalSujet(interaction);
				} else if (
					interaction.isStringSelectMenu() &&
					interaction.customId.startsWith('choix_format|')
				) {
					await this.handleSelectFormat(interaction);
				} else if (
					interaction.isStringSelectMenu() &&
					interaction.customId.startsWith('choix_contributeur|')
				) {
					await this.handleSelectContributeur(interaction);
				}
			},
		);

		// Gestion des réactions sur les messages (votes)
		this.client.on(
			Events.MessageReactionAdd,
			async (
				reaction:
					| MessageReaction
					| import('discord.js').PartialMessageReaction,
				user: User | import('discord.js').PartialUser,
			) => {
				// On complète les objets partiels si besoin (cas des messages non-cachés)
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
				await this.handleMessageReactionAdd(
					reaction as MessageReaction,
					user as User,
				);
			},
		);

		// Récupération du token Discord depuis les variables d'environnement
		const token = process.env.DISCORD_TOKEN;
		if (!token) {
			this.logger.error(
				'DISCORD_TOKEN is not defined in environment variables!',
			);
			return;
		}
		// Connexion du bot à Discord
		this.client.login(token);
	}

	// Extrait les infos d'une proposition à partir du contenu du message Discord
	private extractPropositionInfo(messageContent: string) {
		const lines = messageContent.split('\n');
		const subject =
			lines
				.find((l) => l.startsWith('**Subject**'))
				?.replace('**Subject** : ', '')
				.trim() || '';
		const format =
			lines
				.find((l) => l.startsWith('**Format**'))
				?.replace('**Format** : ', '')
				.trim() || '';
		const proposedByMatch = messageContent.match(/by <@!?([0-9]+)>/);
		const proposedBy = proposedByMatch ? proposedByMatch[1] : null;
		return { subject, format, proposedBy };
	}

	// Récupère la liste des utilisateurs ayant voté avec un emoji donné sur une réaction
	private async getVotersFromReaction(
		reaction: MessageReaction,
		emoji: string,
	) {
		const react = reaction.message.reactions.cache.get(emoji);
		if (!react) return [];
		const users = await react.users.fetch();
		return users.filter((u: any) => !u.bot).map((u: any) => u.id);
	}

	// === HANDLERS ===
	// Gère le clic sur le bouton "Proposer une idée" : ouvre un modal pour saisir le sujet et la description
	private async handleProposerIdee(interaction: any) {
		const modal = new ModalBuilder()
			.setCustomId('formulaire_idee_sujet')
			.setTitle('Propose an idea');
		const sujetInput = new TextInputBuilder()
			.setCustomId('sujet')
			.setLabel('What is the subject?')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		// AJOUT : champ description
		const descriptionInput = new TextInputBuilder()
			.setCustomId('description')
			.setLabel('Describe your idea')
			.setStyle(TextInputStyle.Paragraph)
			.setRequired(true);
		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			sujetInput,
		);
		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(
			descriptionInput,
		);
		modal.addComponents(row1, row2);
		await interaction.showModal(modal);
	}

	// Gère la soumission du modal : propose un select menu pour choisir le format
	private async handleModalSujet(interaction: any) {
		const sujet = interaction.fields.getTextInputValue('sujet');
		const description = interaction.fields.getTextInputValue('description');
		const id = randomUUID();
		this.pendingProposals.set(id, { sujet, description });
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_format|${id}`)
			.setPlaceholder('Choose the format')
			.addOptions([
				{ label: 'Whitepaper', value: 'Whitepaper' },
				{ label: 'Masterclass', value: 'Masterclass' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		await interaction.reply({
			content: 'Select the format for your proposal:',
			components: [row],
			ephemeral: true,
		});
	}

	// Gère la sélection du format : publie la proposition dans #votes-idees et ajoute les réactions de vote
	private async handleSelectFormat(interaction: any) {
		// 1. Déférer la réponse dès le début
		await interaction.deferUpdate();
		const format = interaction.values[0];
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Error: proposal not found.',
				ephemeral: true,
			});
			return;
		}
		proposal.format = format;
		this.pendingProposals.set(id, proposal);

		// 1. Met à jour le message du select menu format pour indiquer que le format est validé
		await interaction.editReply({
			content: `✅ Format selected: **${format}**`,
			components: [],
			ephemeral: true,
		});

		// 2. Affiche le select menu contributeur
		const select = new StringSelectMenuBuilder()
			.setCustomId(`choix_contributeur|${id}`)
			.setPlaceholder('Do you want to be a contributor?')
			.addOptions([
				{ label: 'Yes', value: 'yes' },
				{ label: 'No', value: 'no' },
			]);
		const row = new ActionRowBuilder().addComponents(select);
		await interaction.followUp({
			content: 'Do you want to be a contributor for this idea?',
			components: [row],
			ephemeral: true,
		});
	}

	// Nouveau handler pour le choix contributeur
	private async handleSelectContributeur(interaction: any) {
		// 1. Déférer la réponse dès le début
		await interaction.deferUpdate();
		const contributeur = interaction.values[0] === 'yes';
		const id = interaction.customId.split('|')[1];
		const proposal = this.pendingProposals.get(id);
		if (!proposal) {
			await interaction.followUp({
				content: 'Error: proposal not found.',
				ephemeral: true,
			});
			return;
		}
		const { sujet, description, format } = proposal;
		await this.sendProposalToDiscordChannel({
			guildId: interaction.guild.id,
			sujet,
			description,
			format,
			contributeur,
			discordUserId: interaction.user.id,
		});
		// === Création de la proposition en BDD ===
		try {
			// Cherche l'utilisateur en BDD par son Discord ID
			const submitter = await this.userRepository.findOne({
				where: { discordId: interaction.user.id },
			});
			// Récupère le serveur Discord pour la communauté (pour la création BDD)
			const discordServerForDb =
				await this.discordServerRepository.findOne({
					where: { discordGuildId: interaction.guild.id },
					relations: ['community'],
				});
			if (!submitter) {
				this.logger.warn(
					`Discord user ${interaction.user.id} not found in database when creating proposal.`,
				);
			} else if (!discordServerForDb?.community) {
				this.logger.warn(
					`No community linked to Discord server when creating proposal.`,
				);
			} else {
				// Vérifie si la proposition existe déjà (évite doublon si double clic)
				let existing = await this.proposalRepository.findOne({
					where: {
						title: sujet,
						format: format,
						submitter: { id: submitter.id },
						community: { id: discordServerForDb.community.id },
					},
					relations: ['submitter', 'community'],
				});
				if (!existing) {
					const proposalEntity = this.proposalRepository.create({
						title: sujet,
						description: description,
						format: format,
						isContributor: contributeur,
						status: 'in_progress',
						submitter: submitter,
						community: discordServerForDb.community,
						endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
					});
					await this.proposalRepository.save(proposalEntity);
				}
			}
		} catch (e) {
			this.logger.error('Error while creating proposal in database:', e);
		}
		this.pendingProposals.delete(id);
		try {
			await interaction.editReply({
				content: '✅ Your proposal has been sent for voting!',
				components: [],
				ephemeral: true,
			});
		} catch (e) {
			this.logger.error(
				'Error editing interaction (probably expired):',
				e,
			);
		}
	}

	// Gère l'ajout d'une réaction sur un message de vote
	private async handleMessageReactionAdd(
		reaction: MessageReaction,
		user: User,
	) {
		const discordServer = await this.discordServerRepository.findOne({
			where: { discordGuildId: reaction.message.guild.id },
			relations: ['community'],
		});
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId) {
			throw new Error('No vote channel assigned in database.');
		}
		try {
			if (user.bot) return;
			// Vérifie que le channel est bien le bon
			const channel = reaction.message.channel;
			if (!('id' in channel) || channel.id !== voteChannelId) return;
			// Vérifie que le message est bien une proposition
			if (
				!reaction.message.content ||
				!reaction.message.content.startsWith('📢 New idea proposed by')
			)
				return;
			// Extrait les infos de la proposition
			const { subject, format, proposedBy } = this.extractPropositionInfo(
				reaction.message.content ?? '',
			);
			// Cherche la communauté liée au serveur Discord
			const community = discordServer?.community
				? await this.communityRepository.findOne({
						where: { id: discordServer.community.id },
					})
				: null;
			if (!community) {
				this.logger.warn(
					`Community not found for Discord server ${reaction.message.guild.id}`,
				);
				return;
			}
			// Cherche la proposition existante (toujours nécessaire)
			let proposal = await this.proposalRepository.findOne({
				where: {
					title: subject,
					format: format,
					community: { id: community.id },
				},
				relations: ['community'],
			});
			if (!proposal) {
				this.logger.error(
					`Critical inconsistency: Discord proposal (title: ${subject}, format: ${format}) does not exist in database during voting or status update.`,
				);
				return;
			}
			// --- ENREGISTREMENT DU VOTE INDIVIDUEL ---
			let voteType: 'subject' | 'format' | null = null;
			let voteValue: 'for' | 'against' | null = null;
			if (reaction.emoji.name === '✅') {
				voteType = 'subject';
				voteValue = 'for';
			} else if (reaction.emoji.name === '❌') {
				voteType = 'subject';
				voteValue = 'against';
			} else if (reaction.emoji.name === '👍') {
				voteType = 'format';
				voteValue = 'for';
			} else if (reaction.emoji.name === '👎') {
				voteType = 'format';
				voteValue = 'against';
			}
			if (voteType && voteValue) {
				// Cherche l'utilisateur en BDD par son Discord ID
				const voter = await this.userRepository.findOne({
					where: { discordId: user.id },
				});
				if (!voter) {
					this.logger.warn(
						`Discord user ${user.id} not found in database`,
					);
					return;
				}
				// Vérifie si le vote existe déjà
				let vote = await this.voteRepository.findOne({
					where: {
						proposal: { id: proposal.id },
						user: { id: voter.id },
					},
				});
				if (!vote) {
					vote = this.voteRepository.create({
						proposal,
						user: voter,
					});
				}
				if (voteType === 'subject') {
					vote.choice = voteValue;
				} else if (voteType === 'format') {
					vote.formatChoice = voteValue;
				}
				await this.voteRepository.save(vote);
			}
			// --- LOGIQUE DE VALIDATION/REJET ---
			let subjectYes = [],
				subjectNo = [],
				formatYes = [],
				formatNo = [];
			try {
				subjectYes = await this.getVotersFromReaction(reaction, '✅');
				subjectNo = await this.getVotersFromReaction(reaction, '❌');
				formatYes = await this.getVotersFromReaction(reaction, '👍');
				formatNo = await this.getVotersFromReaction(reaction, '👎');
			} catch (err: any) {
				if (err?.code === 10008) {
					this.logger.warn(
						'[DiscordBotService] Tried to fetch reactions for a message that no longer exists (probably deleted right after vote validation). This is normal if a user tried to react just after the message was deleted.',
					);
					return;
				}
				throw err;
			}
			// --- ENREGISTREMENT EN BDD : update statut uniquement ---
			const resultsChannelId = discordServer?.resultChannelId;
			if (!resultsChannelId) {
				throw new Error('No results channel assigned in database.');
			}
			const resultsChannel =
				reaction.message.guild.channels.cache.get(resultsChannelId);
			if (
				!resultsChannel ||
				resultsChannel.type !== ChannelType.GuildText
			) {
				throw new Error(
					'The results channel does not exist or is not a text channel.',
				);
			}
			let newStatus: 'accepted' | 'rejected' | null = null;
			if (subjectNo.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`❌ The following proposal has been rejected:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				newStatus = 'rejected';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			if (subjectYes.length >= this.VOTES_NECESSAIRES) {
				await resultsChannel.send(
					`✅ The following proposal has been **approved**:\n**Subject** : ${subject}\n**Format** : ${format}`,
				);
				newStatus = 'accepted';
				try {
					await reaction.message.delete();
				} catch (e) {}
			}
			if (newStatus) {
				proposal.status = newStatus;
				await this.proposalRepository.save(proposal);
			}
		} catch (e) {
			this.logger.error('Error in MessageReactionAdd:', e);
		}
	}

	/**
	 * Crée les channels textuels s'ils n'existent pas déjà sur le serveur Discord
	 */
	async createChannelsIfNotExist(
		guildId: string,
		proposeName?: string,
		voteName?: string,
		resultName?: string,
	) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
			await guild.fetch(); // S'assure que les channels sont bien chargés
			const created: string[] = [];
			const existing: string[] = [];

			const names = [proposeName, voteName, resultName].filter(Boolean);
			let salonIdees = null;
			// Si aucun nom n'est fourni, on ne crée pas de channels
			if (names.length === 0) {
				return { created, existing };
			}
			for (const name of names) {
				const found = guild.channels.cache.find(
					(ch) =>
						ch.type === ChannelType.GuildText && ch.name === name,
				);
				if (found) {
					existing.push(name);
				} else {
					const createdChannel = await guild.channels.create({
						name,
						type: ChannelType.GuildText,
					});
					created.push(name);
					if (name === proposeName) salonIdees = createdChannel;
				}
			}
			// Effectue le setup dans le salon de propositions
			if (salonIdees) {
				try {
					const fetched = await salonIdees.messages.fetch({
						limit: 100,
					});
					if (fetched.size > 0)
						await salonIdees.bulkDelete(fetched, true);
				} catch (e) {}
				let voteChannelId = null;
				if (!voteName) {
					const discordServer =
						await this.discordServerRepository.findOne({
							where: { discordGuildId: guildId },
						});
					voteChannelId = discordServer?.voteChannelId;
				} else {
					const voteChannel = guild.channels.cache.find(
						(ch) =>
							ch.type === ChannelType.GuildText &&
							ch.name === voteName.toLowerCase(),
					);
					voteChannelId = voteChannel?.id;
				}
				const explication =
					'🎉 **Submit your ideas!**\n\n' +
					'To submit an idea:\n' +
					'1. Click the **📝 Submit an idea** button below.\n' +
					'2. Enter the subject of your idea and its description.\n' +
					'3. Select the desired format (**Whitepaper** or **Masterclass**).\n' +
					'4. Indicate if you want to be a contributor for this idea.\n\n' +
					'Your proposal will then be sent to the <#' +
					voteChannelId +
					'> channel for everyone to vote!';
				const button = new ButtonBuilder()
					.setCustomId('proposer_idee')
					.setLabel('📝 Submit an idea')
					.setStyle(ButtonStyle.Primary);
				const row = new ActionRowBuilder().addComponents(button);
				const sent = await salonIdees.send({
					content: explication,
					components: [row],
				});
				try {
					await sent.pin();
				} catch (e) {}
			}
			return { created, existing };
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error creating Discord channels:', err);
			return {
				error: 'Error while creating channels',
				details: err.message,
			};
		}
	}

	/**
	 * Renomme les channels textuels existants
	 */
	async renameChannels(
		guildId: string,
		oldNames: { propose: string; vote: string; result: string },
		newNames: { propose: string; vote: string; result: string },
	) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
			await guild.fetch();
			const results = [];
			const pairs = [
				{ old: oldNames.propose, new: newNames.propose },
				{ old: oldNames.vote, new: newNames.vote },
				{ old: oldNames.result, new: newNames.result },
			];
			for (const { old, new: newName } of pairs) {
				const channel = guild.channels.cache.find(
					(ch) =>
						ch.type === ChannelType.GuildText && ch.name === old,
				);
				if (channel && channel.isTextBased()) {
					await channel.edit({ name: newName });
					results.push({ old, new: newName, status: 'renamed' });
				} else {
					results.push({ old, new: newName, status: 'not_found' });
				}
			}
			return { results };
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error renaming Discord channels:', err);
			return {
				error: 'Error while renaming channels',
				details: err.message,
			};
		}
	}

	/**
	 * Liste les channels textuels du serveur Discord
	 */
	async listTextChannels(guildId: string) {
		try {
			const guild = await this.client.guilds.fetch(guildId);
			await guild.fetch();
			const channels = guild.channels.cache
				.filter((ch) => ch.type === ChannelType.GuildText)
				.map((ch) => ({ id: ch.id, name: ch.name }));
			return channels;
		} catch (e) {
			const err = e as Error;
			this.logger.error('Error listing Discord channels:', err);
			return {
				error: 'Error while listing channels',
				details: err.message,
			};
		}
	}

	// Ajoute la méthode utilitaire
	async sendProposalToDiscordChannel({
		guildId,
		sujet,
		description,
		format,
		contributeur,
		discordUserId,
	}: {
		guildId: string;
		sujet: string;
		description: string;
		format: string;
		contributeur: boolean;
		discordUserId: string;
	}) {
		const discordServer = await this.discordServerRepository.findOne({
			where: { discordGuildId: guildId },
		});
		const voteChannelId = discordServer?.voteChannelId;
		if (!voteChannelId) {
			throw new Error('No vote channel assigned in database.');
		}
		const guild = await this.client.guilds.fetch(guildId);
		const salonVotes = guild.channels.cache.get(voteChannelId);
		if (!salonVotes || salonVotes.type !== ChannelType.GuildText) {
			throw new Error(
				'The vote channel does not exist or is not a text channel.',
			);
		}
		const messageVote = await salonVotes.send(
			`📢 New idea proposed by <@${discordUserId}> :\n\n**Subject** : ${sujet}\n**Description** : ${description}\n**Format** : ${format}\n**Contributor** : ${contributeur ? 'Yes' : 'No'}\n\n**Vote Subject** : ✅ = Yes | ❌ = No\n**Vote Format** : 👍 = Yes | 👎 = No`,
		);
		await messageVote.react('✅');
		await messageVote.react('❌');
		await messageVote.react('👍');
		await messageVote.react('👎');
		return messageVote;
	}
}
