import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { CreateProposalDto } from './dto/create-proposal.dto/create-proposal.dto';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';
import { DiscordProposalService } from 'src/discord-bot/services/discord-proposal.service';

@Injectable()
export class ProposalService {
	constructor(
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		@InjectRepository(User)
		private userRepository: Repository<User>,
		private readonly discordProposalService: DiscordProposalService,
	) {}

	async findAllForACommunityBySlug(
		communitySlug: string,
	): Promise<Proposal[]> {
		const proposals = await this.proposalRepository.find({
			where: { community: { slug: communitySlug } },
			relations: [
				'community',
				'submitter',
				'community.learners',
				'votes',
			],
			order: {
				endedAt: 'DESC',
			},
		});
		const now = new Date();
		const toUpdate: Proposal[] = [];

		// Quand on récupère la liste des propositions, on vérifie si elles ont expiré
		proposals.forEach((proposal) => {
			if (proposal.status === 'in_progress' && proposal.deadline < now) {
				proposal.endedAt = new Date();
				proposal.status = 'rejected';
				toUpdate.push(proposal);
			}
		});
		if (toUpdate.length > 0) {
			await this.proposalRepository.save(toUpdate);
		}
		return proposals;
	}

	async create(
		createProposalDto: CreateProposalDto,
		communitySlug: string,
	): Promise<Proposal> {
		const { communityId, submitterId, ...rest } = createProposalDto;
		const community = await this.communityRepository.findOne({
			where: { slug: communitySlug },
			relations: ['user', 'discordServer'],
		});
		const submitter = await this.userRepository.findOne({
			where: { id: submitterId },
			relations: ['communities', 'learners'],
		});
		if (
			!community ||
			!submitter ||
			(!submitter.communities.some((c) => c.id === community.id) &&
				!submitter.learners.some(
					(l) => l.community.id === community.id,
				))
		) {
			throw new NotFoundException('Community or user not found');
		}

		const proposal = this.proposalRepository.create({
			...rest,
			community,
			submitter,
		});
		let savedProposal = await this.proposalRepository.save(proposal);

		const discordServer = community.discordServer;
		if (discordServer && submitter.discordId) {
			const message =
				await this.discordProposalService.sendProposalToDiscordChannel({
					guildId: discordServer.guildId,
					sujet: proposal.title,
					description: proposal.description,
					format: proposal.format,
					contributeur: proposal.isContributor,
					discordUserId: submitter.discordId,
				});

			if (message) {
				savedProposal.messageId = message.id;
				savedProposal =
					await this.proposalRepository.save(savedProposal);
			}
		}
		return savedProposal;
	}

	async findOneByMessageId(messageId: string): Promise<Proposal | null> {
		return this.proposalRepository.findOne({
			where: { messageId },
			relations: [
				'community',
				'votes',
				'submitter',
				'community.learners',
			],
		});
	}

	async updateProposalStatus(proposal: Proposal) {
		const now = new Date();
		const quorumReached = proposal.votes.length >= proposal.quorum.required;
		const timeOver = now > proposal.deadline;

		if (proposal.status !== 'in_progress') return proposal; // déjà terminé

		if (quorumReached || timeOver) {
			const yesVotes = proposal.votes.filter(
				(v) => v.choice === 'for',
			).length;
			const noVotes = proposal.votes.filter(
				(v) => v.choice === 'against',
			).length;
			proposal.status = yesVotes > noVotes ? 'accepted' : 'rejected';

			// Si la proposition est acceptée, on vérifie le vote sur le format
			if (proposal.status === 'accepted') {
				const yesFormatVotes = proposal.votes.filter(
					(v) => v.formatChoice === 'for',
				).length;
				const noFormatVotes = proposal.votes.filter(
					(v) => v.formatChoice === 'against',
				).length;

				if (noFormatVotes >= yesFormatVotes) {
					proposal.format = 'toBeDefined';
				}
			}

			proposal.endedAt = now;
			await this.proposalRepository.save(proposal);
		}
		return proposal;
	}
}
