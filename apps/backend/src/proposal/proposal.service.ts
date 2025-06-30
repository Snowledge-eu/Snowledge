import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { Proposal } from './entities/proposal.entity';

@Injectable()
export class ProposalService {
	constructor(
		@InjectRepository(Proposal)
		private proposalRepository: Repository<Proposal>,
	) {}

	async findAllForACommunityBySlug(
		communitySlug: string,
		orderBy: string = 'endedAt',
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
				[orderBy]: 'DESC',
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
		proposalData: Partial<Proposal>,
		manager?: EntityManager,
	): Promise<Proposal> {
		const repository = manager
			? manager.getRepository(Proposal)
			: this.proposalRepository;
		const proposal = repository.create(proposalData);
		return repository.save(proposal);
	}

	async findOneByMessageId(
		messageId: string,
		manager?: EntityManager,
	): Promise<Proposal | null> {
		const repository = manager
			? manager.getRepository(Proposal)
			: this.proposalRepository;
		return repository.findOne({
			where: { messageId },
			relations: [
				'community',
				'votes',
				'submitter',
				'community.learners',
			],
		});
	}

	async findOneById(
		id: number,
		manager?: EntityManager,
	): Promise<Proposal | null> {
		const repository = manager
			? manager.getRepository(Proposal)
			: this.proposalRepository;
		return repository.findOne({
			where: { id },
			relations: [
				'community',
				'community.discordServer',
				'votes',
				'submitter',
			],
		});
	}

	async save(proposal: Proposal, manager?: EntityManager): Promise<Proposal> {
		const repository = manager
			? manager.getRepository(Proposal)
			: this.proposalRepository;
		return repository.save(proposal);
	}
}
