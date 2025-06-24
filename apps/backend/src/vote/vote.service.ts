import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ProposalService } from 'src/proposal/proposal.service';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { Community } from 'src/community/entities/community.entity';
import { MessageReaction, User } from 'discord.js';
import { UserService } from 'src/user/user.service';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
		private proposalService: ProposalService,
		private userService: UserService,
		private dataSource: DataSource,
	) {}

	async handleReactionVote(
		reaction: MessageReaction,
		user: User,
	): Promise<Proposal> {
		return this.dataSource.transaction(
			async (transactionalEntityManager) => {
				const proposal = await transactionalEntityManager
					.getRepository(Proposal)
					.findOne({
						where: { messageId: reaction.message.id },
					});

				if (!proposal || proposal.status !== 'in_progress') return null;

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

				if (!voteType || !voteValue) return null;

				const voter = await this.userService.findOneByDiscordId(
					user.id,
				);
				if (!voter) return null;

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
					if (voteType === 'format') payload.formatChoice = voteValue;
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
								voteType === 'subject' ? voteValue : undefined,
							formatChoice:
								voteType === 'format' ? voteValue : undefined,
						});
					await transactionalEntityManager.save(newVote);
				}

				return this.proposalService.findOneByMessageId(
					reaction.message.id,
				);
			},
		);
	}

	async create(proposalId: number, createVoteDto: CreateVoteDto) {
		// 1. Récupérer la proposition et la communauté associée
		const proposal = await this.proposalRepository.findOne({
			where: { id: proposalId },
			relations: ['community', 'votes'],
		});
		if (!proposal) throw new NotFoundException('Proposal not found');

		const community = await this.communityRepository.findOne({
			where: { id: proposal.community.id },
			relations: ['learners'],
		});
		if (!community) throw new NotFoundException('Community not found');

		// 2. Créer et sauvegarder le vote
		const vote = this.voteRepository.create({
			...createVoteDto,
			proposal,
			user: { id: createVoteDto.userId },
		});
		await this.voteRepository.save(vote);

		// Recharge la proposition avec les votes à jour
		const updatedProposal = await this.proposalRepository.findOne({
			where: { id: proposalId },
			relations: ['community', 'votes'],
		});

		await this.proposalService.updateProposalStatus(updatedProposal);

		return vote;
	}

	async findAllByUserId(communitySlug: string, userId: number) {
		return this.voteRepository.find({
			where: {
				proposal: {
					community: {
						slug: communitySlug,
					},
				},
				user: {
					id: userId,
				},
			},
			relations: {
				proposal: true,
				user: true,
			},
		});
	}
}
