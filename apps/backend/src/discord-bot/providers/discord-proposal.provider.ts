import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
	ModalSubmitInteraction,
	StringSelectMenuInteraction,
} from 'discord.js';
import { randomUUID } from 'crypto';
import { DiscordProposalService } from '../services/discord-proposal.service';
import { DiscordProposalFormService } from '../services/discord-proposal-form.service';
import { ProposalProvider } from 'src/proposal/proposal.provider';
import { CommunityService } from 'src/community/community.service';
import { UserService } from 'src/user/user.service';
import { DiscordLogicProvider } from './discord-logic.provider';
import { DiscordServerService } from 'src/discord-server/discord-server.service';
import { ChannelType } from 'discord.js';
import {
	getSubmissionExplanation,
	getVoteExplanation,
	getResultExplanation,
} from '../utils/discord-proposal.utils';
import { DiscordClientService } from '../services/discord-client.service';
import type { Proposal } from 'src/proposal/entities/proposal.entity';
import { DiscordMessageService } from 'src/discord/services/discord-message.service';

@Injectable()
export class DiscordProposalProvider {
	private readonly logger = new Logger(DiscordProposalProvider.name);
	private pendingProposals = new Map<
		string,
		{ subject: string; description: string; format?: string }
	>();

	constructor(
		private readonly discordProposalService: DiscordProposalService,
		private readonly formService: DiscordProposalFormService,
		private readonly proposalProvider: ProposalProvider,
		private readonly communityService: CommunityService,
		private readonly userService: UserService,
		private readonly discordLogicProvider: DiscordLogicProvider,
		private readonly discordServerService: DiscordServerService,
		private readonly discordClientService: DiscordClientService,
		private readonly discordMessageService: DiscordMessageService,
	) {}

	@OnEvent('proposal.created')
	async onProposalCreated(proposal: Proposal) {
		this.logger.log(
			`Received proposal.created event for proposal #${proposal.id}`,
		);
		try {
			// 1. On crée l'embed
			const embed = this.discordLogicProvider.createProposalEmbed(
				proposal,
				proposal.votes.length,
				proposal.quorum.required,
				proposal.votes.filter((v) => v.choice === 'for').length,
				proposal.votes.filter((v) => v.choice === 'against').length,
				proposal.votes.filter((v) => v.formatChoice === 'for').length,
				proposal.votes.filter((v) => v.formatChoice === 'against')
					.length,
			);

			// 2. On envoie le message sur Discord
			const notificationResult =
				await this.discordProposalService.sendCreationNotification(
					embed,
					proposal.community,
					proposal.format !== 'undefined',
				);

			// 3. On met à jour la proposition avec l'ID du message
			if (notificationResult?.messageId) {
				await this.proposalProvider.updateMessageId(
					proposal.id,
					notificationResult.messageId,
				);
			}
		} catch (error) {
			this.logger.error(
				`Failed to process proposal.created event for proposal #${proposal.id}`,
				error,
			);
		}
	}

	async handleProposerIdee(interaction: any) {
		const modal = this.formService.createIdeaModal();
		await interaction.showModal(modal);
	}

	async handleModalSujet(interaction: ModalSubmitInteraction): Promise<void> {
		if (interaction.customId === 'formulaire_idee_sujet') {
			const subject = interaction.fields.getTextInputValue('sujet');
			const description =
				interaction.fields.getTextInputValue('description');
			const id = randomUUID();
			this.pendingProposals.set(id, { subject, description });
			const row = this.formService.createFormatSelect(id);
			await interaction.reply({
				content: 'Now, choose the format proposed',
				components: [row.toJSON()],
				ephemeral: true,
			});
		}
	}

	async handleSelectFormat(
		interaction: StringSelectMenuInteraction,
	): Promise<void> {
		const [_, id] = interaction.customId.split('|');
		const proposal = this.pendingProposals.get(id);
		if (proposal) {
			proposal.format = interaction.values[0];
			const row = this.formService.createContributorSelect(id);
			await interaction.update({
				content: 'Would you like to be a contributor on this topic?',
				components: [row.toJSON()],
			});
		}
	}

	async handleSelectContributeur(
		interaction: StringSelectMenuInteraction,
	): Promise<void> {
		const [_, id] = interaction.customId.split('|');
		const proposalData = this.pendingProposals.get(id);
		if (!proposalData) {
			await interaction.reply({
				content: 'Proposal not found',
				ephemeral: true,
			});
			return;
		}
		const isContributor = interaction.values[0] === 'true';

		try {
			// 1. Trouver la communauté et l'utilisateur
			const community =
				await this.communityService.findOneByDiscordServerId(
					interaction.guild.id,
				);
			if (!community) throw new NotFoundException('Community not found');
			const user = await this.userService.findOneByDiscordId(
				interaction.user.id,
			);
			if (!user) throw new NotFoundException('User not found');

			// 2. On crée la proposition en base de données
			const newProposal = await this.proposalProvider.create(
				{
					title: proposalData.subject,
					description: proposalData.description,
					format: proposalData.format,
					isContributor,
					submitterId: user.id,
					communityId: community.id,
				},
				community.slug,
			);

			// La logique de notification est maintenant gérée par l'événement `proposal.created`
			// qui est émis par `proposalProvider.create`.
			// Nous n'avons plus besoin du code de notification ici.

			this.pendingProposals.delete(id);
			await interaction.update({
				content: 'Your proposal has been sent!',
				components: [],
			});
		} catch (e) {
			this.logger.error(
				'Erreur lors de la création de la proposition',
				e,
			);
			this.pendingProposals.delete(id);
			await interaction.update({
				content: 'An error occurred while creating your proposal.',
				components: [],
			});
		}
	}

	async createChannelsIfNotExist(
		guildId: string,
		proposeName?: string,
		voteName?: string,
		resultName?: string,
	) {
		const client = this.discordClientService.getClient();
		const guild = await client.guilds.fetch(guildId);
		const created: string[] = [];
		const existing: string[] = [];
		const names = [proposeName, voteName, resultName].filter(Boolean);
		let salonIdees = null;
		let voteChannel = null;
		let resultChannel = null;

		for (const name of names) {
			const found = guild.channels.cache.find(
				(ch) => ch.type === ChannelType.GuildText && ch.name === name,
			);
			if (found) {
				existing.push(name);
				if (name === voteName) voteChannel = found;
				if (name === resultName) resultChannel = found;
			} else {
				const role = guild.roles.cache.find(
					(r) => r.name === 'Snowledge Authenticated',
				);
				if (!role) {
					throw new Error(
						"The 'Snowledge Authenticated' role does not exist on this server!",
					);
				}
				const createdChannel = await guild.channels.create({
					name,
					type: ChannelType.GuildText,
					permissionOverwrites: [
						{ id: guild.roles.everyone.id, deny: ['ViewChannel'] },
						{
							id: role.id,
							allow: ['ViewChannel'],
							deny: ['SendMessages'],
						},
						{
							id: client.user.id,
							allow: ['ViewChannel', 'SendMessages'],
						},
					],
				});
				created.push(name);
				if (name === proposeName) salonIdees = createdChannel;
				if (name === voteName) voteChannel = createdChannel;
				if (name === resultName) resultChannel = createdChannel;
			}
		}

		if (salonIdees) {
			let voteChannelId = voteChannel?.id;
			if (!voteChannelId) {
				const discordServer =
					await this.discordServerService.findOne(guildId);
				voteChannelId = discordServer?.voteChannelId;
			}
			const explication = getSubmissionExplanation(voteChannelId);
			const button = this.formService.createIdeaButton();
			const sent = await salonIdees.send({
				content: explication,
				components: [button],
			});
			await sent.pin();
		}

		if (voteChannel) {
			const voteExplanation = getVoteExplanation();
			const voteMsg = await voteChannel.send({
				content: voteExplanation,
			});
			await voteMsg.pin();
		}

		if (resultChannel) {
			const resultExplanation = getResultExplanation();
			const resultMsg = await resultChannel.send({
				content: resultExplanation,
			});
			await resultMsg.pin();
		}

		return { created, existing };
	}

	async renameChannels(
		guildId: string,
		oldNames: { propose: string; vote: string; result: string },
		newNames: { propose: string; vote: string; result: string },
	) {
		const client = this.discordClientService.getClient();
		const guild = await client.guilds.fetch(guildId);
		const renames = [];
		for (const key of ['propose', 'vote', 'result']) {
			if (oldNames[key] && newNames[key]) {
				const channel = guild.channels.cache.find(
					(ch) => ch.name === oldNames[key],
				);
				if (channel) {
					await channel.edit({ name: newNames[key] });
					renames.push({
						from: oldNames[key],
						to: newNames[key],
					});
				}
			}
		}
		return { renames };
	}

	async listTextChannels(guildId: string) {
		// const client = this.discordClientService.getClient();
		// const guild = await client.guilds.fetch(guildId);
		// const channels = guild.channels.cache
		// 	.filter((ch) => ch.type === ChannelType.GuildText)
		// 	.map((ch) => ({ id: ch.id, name: ch.name }));
		// return channels;

		const client = this.discordClientService.getClient();
		const guild = await client.guilds.fetch(guildId);
		const textChannels = guild.channels.cache.filter((ch) => ch.type === ChannelType.GuildText);

		const channelIds = textChannels.map((ch) => ch.id);
		// Appel au service Mongo pour savoir quels salons ont déjà des messages
		const harvestedIds = await this.discordMessageService.findHarvestedChannelIds(channelIds);

		// Marquage des salons
		return textChannels.map((ch) => ({
			id: ch.id,
			name: ch.name,
			harvested: harvestedIds.includes(ch.id),
		}));
	}
}
