import { Injectable, NotFoundException } from '@nestjs/common';
import type { Proposal } from './entities/proposal.entity';
import { ProposalService } from './proposal.service';
import { CreateProposalDto } from './dto/create-proposal.dto/create-proposal.dto';
import { CommunityService } from 'src/community/community.service';
import { UserService } from 'src/user/user.service';
import { Community } from 'src/community/entities/community.entity';
import { User } from 'src/user/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class ProposalProvider {
	constructor(
		private readonly proposalService: ProposalService,
		private readonly communityService: CommunityService,
		private readonly userService: UserService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	async findAllForACommunityBySlug(
		communitySlug: string,
	): Promise<Proposal[]> {
		return this.proposalService.findAllForACommunityBySlug(communitySlug);
	}

	async findAllInProgressForACommunityBySlug(
		communitySlug: string,
	): Promise<Proposal[]> {
		return this.proposalService.findAllForACommunityBySlug(
			communitySlug,
			'createdAt',
		);
	}

	async create(
		createProposalDto: CreateProposalDto,
		communitySlug: string,
	): Promise<Proposal> {
		const { submitterId, ...rest } = createProposalDto;

		const community =
			await this.communityService.findOneBySlug(communitySlug);
		const submitter = await this.userService.findOneById(submitterId);

		if (
			!community ||
			!submitter ||
			(!submitter.communities?.some((c) => c.id === community.id) &&
				!submitter.learners?.some(
					(l) => l.community.id === community.id,
				))
		) {
			throw new NotFoundException('Community or user not found');
		}

		const proposalToCreate = {
			...rest,
			community: { id: community.id } as Community,
			submitter: { id: submitter.id } as User,
		};

		const savedProposal =
			await this.proposalService.create(proposalToCreate);

		const fullProposal = await this.proposalService.findOneById(
			savedProposal.id,
		);

		if (!fullProposal) {
			throw new NotFoundException('Could not retrieve created proposal');
		}

		this.eventEmitter.emit('proposal.created', fullProposal);

		return fullProposal;
	}

	async updateMessageId(
		proposalId: number,
		messageId: string,
	): Promise<Proposal> {
		const proposal = await this.proposalService.findOneById(proposalId);
		if (!proposal) {
			throw new NotFoundException('Proposal not found');
		}
		proposal.messageId = messageId;
		return this.proposalService.save(proposal);
	}

	async updateProposalStatus(proposal: Proposal): Promise<Proposal> {
		const now = new Date();
		const quorumReached =
			proposal.votes.filter((v) => v.choice !== null).length >=
			proposal.quorum.required;
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
			const savedProposal = await this.proposalService.save(proposal);
			// Pas de notification ici pour le moment, on se concentre sur la création
			return savedProposal;
		}
		return proposal;
	}
}
