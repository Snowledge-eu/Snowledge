import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearnerService } from './learner.service';
import { Learner, LearnerStatus } from './entities/learner/learner';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';

describe('LearnerService', () => {
	let service: LearnerService;
	let mockLearnerRepository: jest.Mocked<Repository<Learner>>;
	let mockCommunityRepository: jest.Mocked<Repository<Community>>;
	let mockUserRepository: jest.Mocked<Repository<User>>;

	beforeEach(async () => {
		const mockLearnerRepo = {
			find: jest.fn(),
			findOne: jest.fn(),
			create: jest.fn(),
			save: jest.fn(),
		};

		const mockCommunityRepo = {
			findOne: jest.fn(),
		};

		const mockUserRepo = {
			findOne: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				LearnerService,
				{
					provide: getRepositoryToken(Learner),
					useValue: mockLearnerRepo,
				},
				{
					provide: getRepositoryToken(Community),
					useValue: mockCommunityRepo,
				},
				{
					provide: getRepositoryToken(User),
					useValue: mockUserRepo,
				},
			],
		}).compile();

		service = module.get<LearnerService>(LearnerService);
		mockLearnerRepository = module.get(getRepositoryToken(Learner));
		mockCommunityRepository = module.get(getRepositoryToken(Community));
		mockUserRepository = module.get(getRepositoryToken(User));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getAcceptedUsersDiscordIds', () => {
		it('should return Discord IDs of users who accepted terms', async () => {
			const communityId = 1;
			const mockLearners = [
				{
					id: 1,
					user: { id: 1, discordId: 'discord_user_1' },
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
				{
					id: 2,
					user: { id: 2, discordId: 'discord_user_2' },
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
				{
					id: 3,
					user: { id: 3, discordId: null }, // Utilisateur sans Discord ID
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
				{
					id: 4,
					user: { id: 4, discordId: 'discord_user_4' },
					community: { id: communityId },
					status: LearnerStatus.INVITED, // Statut non-MEMBER
				},
			];

			mockLearnerRepository.find.mockResolvedValue(mockLearners);

			const result =
				await service.getAcceptedUsersDiscordIds(communityId);

			expect(mockLearnerRepository.find).toHaveBeenCalledWith({
				where: {
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
				relations: ['user'],
			});

			expect(result).toEqual(
				new Set(['discord_user_1', 'discord_user_2']),
			);
		});

		it('should return empty set when no users accepted terms', async () => {
			const communityId = 1;
			mockLearnerRepository.find.mockResolvedValue([]);

			const result =
				await service.getAcceptedUsersDiscordIds(communityId);

			expect(result).toEqual(new Set());
		});

		it('should filter out users without Discord IDs', async () => {
			const communityId = 1;
			const mockLearners = [
				{
					id: 1,
					user: { id: 1, discordId: null },
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
				{
					id: 2,
					user: { id: 2, discordId: undefined },
					community: { id: communityId },
					status: LearnerStatus.MEMBER,
				},
			];

			mockLearnerRepository.find.mockResolvedValue(mockLearners);

			const result =
				await service.getAcceptedUsersDiscordIds(communityId);

			expect(result).toEqual(new Set());
		});
	});
});
