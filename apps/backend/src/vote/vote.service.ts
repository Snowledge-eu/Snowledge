import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { CreateVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VoteService {
	constructor(
		@InjectRepository(Vote)
		private voteRepository: Repository<Vote>,
	) {}

	async findOneByProposalAndUser(
		proposalId: number,
		userId: number,
		manager: EntityManager,
	): Promise<Vote> {
		return manager.getRepository(Vote).findOne({
			where: {
				proposal: { id: proposalId },
				user: { id: userId },
			},
		});
	}

	async create(
		voteData: Partial<Vote>,
		manager: EntityManager,
	): Promise<Vote> {
		const vote = manager.getRepository(Vote).create(voteData);
		return manager.getRepository(Vote).save(vote);
	}

	async update(
		voteId: number,
		payload: Partial<Vote>,
		manager: EntityManager,
	): Promise<void> {
		await manager.getRepository(Vote).update(voteId, payload);
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
