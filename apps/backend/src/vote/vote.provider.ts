import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProposalService } from 'src/proposal/proposal.service';
import { MessageReaction, User } from 'discord.js';
import { UserService } from 'src/user/user.service';
import { VoteService } from './vote.service';
import type { Proposal } from 'src/proposal/entities/proposal.entity';
import type { Vote } from './entities/vote.entity';
import type { User as UserEntity } from 'src/user/entities/user.entity';
import { ProposalProvider } from 'src/proposal/proposal.provider';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VoteProvider {
	constructor(
		private readonly dataSource: DataSource,
		private readonly userService: UserService,
		private readonly proposalService: ProposalService,
		private readonly voteService: VoteService,
		private readonly proposalProvider: ProposalProvider,
	) {}

	async create(
		proposalId: number,
		createVoteDto: CreateVoteDto,
		userId: number,
	): Promise<Vote> {
		return this.dataSource.transaction(async (manager) => {
			const proposal = await this.proposalService.findOneById(
				proposalId,
				manager,
			);
			if (!proposal) {
				throw new NotFoundException('Proposal not found');
			}

			const vote = await this.voteService.create(
				{
					...createVoteDto,
					proposal: { id: proposal.id } as Proposal,
					user: { id: userId } as UserEntity,
				},
				manager,
			);

			const updatedProposal = await this.proposalService.findOneById(
				proposal.id,
				manager,
			);

			await this.proposalProvider.updateProposalStatus(updatedProposal);

			return vote;
		});
	}

	async findAllByUserId(
		communitySlug: string,
		userId: number,
	): Promise<Vote[]> {
		return this.voteService.findAllByUserId(communitySlug, userId);
	}

	async handleReactionVote(
		reaction: MessageReaction,
		user: User,
	): Promise<Proposal> {
		return this.dataSource.transaction(async (manager) => {
			const proposal = await this.proposalService.findOneByMessageId(
				reaction.message.id,
				manager,
			);

			if (!proposal || proposal.status !== 'in_progress') return null;

			let voteType: 'subject' | 'format' | null = null;
			let voteValue: 'for' | 'against' | null = null;

			if (reaction.emoji.name === '✅') voteType = 'subject';
			if (reaction.emoji.name === '❌') voteType = 'subject';
			if (reaction.emoji.name === '👍') voteType = 'format';
			if (reaction.emoji.name === '👎') voteType = 'format';
			if (['✅', '👍'].includes(reaction.emoji.name)) voteValue = 'for';
			if (['❌', '👎'].includes(reaction.emoji.name))
				voteValue = 'against';

			if (!voteType || !voteValue) return null;

			const voter = await this.userService.findOneByDiscordId(
				user.id,
				manager,
			);
			if (!voter) return null;

			const existingVote =
				await this.voteService.findOneByProposalAndUser(
					proposal.id,
					voter.id,
					manager,
				);

			if (existingVote) {
				const payload: Partial<Vote> = {};
				if (voteType === 'subject') payload.choice = voteValue;
				if (voteType === 'format') payload.formatChoice = voteValue;
				await this.voteService.update(
					existingVote.id,
					payload,
					manager,
				);
			} else {
				await this.voteService.create(
					{
						proposal: { id: proposal.id } as Proposal,
						user: { id: voter.id } as UserEntity,
						choice: voteType === 'subject' ? voteValue : undefined,
						formatChoice:
							voteType === 'format' ? voteValue : undefined,
					},
					manager,
				);
			}

			return this.proposalService.findOneByMessageId(
				reaction.message.id,
				manager,
			);
		});
	}
}
