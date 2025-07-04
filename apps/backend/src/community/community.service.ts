import {
	Injectable,
	Inject,
	NotFoundException,
	Param,
	Post,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { User } from 'src/user/entities/user.entity';
import { LearnerStatus } from 'src/learner/entities/learner/learner';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';

@Injectable()
export class CommunityService {
	constructor(
		@InjectRepository(Community)
		private communityRepository: Repository<Community>,
	) {}

	async findAll(): Promise<Community[]> {
		return this.communityRepository.find();
	}

	async findAllByUser(userId: number): Promise<Community[]> {
		const ownedCommunities = await this.communityRepository.find({
			where: { user: { id: userId } },
			relations: ['discordServer', 'user'],
		});
		const learnerCommunities = await this.communityRepository.find({
			where: {
				learners: {
					user: { id: userId },
					status: LearnerStatus.MEMBER,
				},
			},
			relations: ['discordServer', 'user'],
		});
		return [...ownedCommunities, ...learnerCommunities];
	}

	async create(data: CreateCommunityDto): Promise<Community> {
		const community = this.communityRepository.create({
			...data,
			user: { id: data.user },
			slug: slugify(data.name, { lower: true, strict: true }),
		});
		return this.communityRepository.save(community);
	}

	async findOneByDiscordServerId(
		discordServerId: string,
	): Promise<Community> {
		return this.communityRepository.findOne({
			where: { discordServer: { guildId: discordServerId } },
			relations: ['user', 'discordServer'],
		});
	}

	async findOneBySlug(slug: string): Promise<Community> {
		return this.communityRepository.findOne({
			where: { slug },
			relations: ['discordServer'],
		});
	}

	async findOneByName(name: string): Promise<Community> {
		return this.communityRepository.findOne({
			where: { name },
			relations: ['discordServer'],
		});
	}

	async findOneById(id: number): Promise<Community> {
		return this.communityRepository.findOne({
			where: { id },
			relations: ['discordServer'],
		});
	}

	async getCommunityCreatorFromSlug(slug: string): Promise<User> {
		const community = await this.findOneBySlug(slug);
		return community.user;
	}
	async updateDiscordGuildId(
		id: number,
		discordServer: DiscordServer,
	): Promise<Community> {
		await this.communityRepository.update(id, { discordServer });

		return this.communityRepository.findOne({
			where: { id },
		});
	}
	// TODO rename / refacto ???
	async update(id: number, data: UpdateCommunityDto): Promise<Community> {
		const community = await this.communityRepository.findOne({
			where: { id },
		});
		if (!community) {
			throw new NotFoundException('Community not found');
		}
		const slug = slugify(data.name, { lower: true, strict: true });
		return this.communityRepository.save({
			...community,
			...data,
			slug,
		});
	}

	// TODO: Dégager après la démo
	// Retourne le userId du créateur de la dernière communauté (par date de création)
	async getLastCommunityUserId(): Promise<number | null> {
		const lastCommunity = await this.communityRepository.find({
			order: { created_at: 'DESC' },
			relations: ['user'],
			// On ne prend que la dernière
			take: 1,
		});
		if (lastCommunity.length === 0) return null;
		return lastCommunity[0].user?.id ?? null;
	}
}
