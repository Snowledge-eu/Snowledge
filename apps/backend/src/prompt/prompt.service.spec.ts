import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PromptService } from './prompt.service';
import { Prompt } from './entities/prompt.entity';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';

describe('PromptService', () => {
	let service: PromptService;
	let repository: any;

	beforeEach(async () => {
		const mockRepository = {
			create: jest.fn(),
			save: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PromptService,
				{
					provide: getRepositoryToken(Prompt),
					useValue: mockRepository,
				},
			],
		}).compile();

		service = module.get<PromptService>(PromptService);
		repository = module.get(getRepositoryToken(Prompt));
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('create', () => {
		it('should create a prompt', async () => {
			const createPromptDto: CreatePromptDto = {
				name: 'test_prompt',
				description: 'Test prompt',
				platform: 'discord',
				temperature: 0.3,
				top_p: 0.8,
				messages: [
					{ role: 'system', content: 'Test system message' },
					{ role: 'user', content: '{{messages}}' },
				],
				response_format: { type: 'json_schema', json_schema: {} },
				is_public: false,
				model_name: 'Llama-3.1-8B-Instruct',
			};
			const userId = 1;
			const mockPrompt = {
				id: 1,
				...createPromptDto,
				created_by: { id: userId },
				created_at: new Date(),
				updated_at: new Date(),
			};

			repository.create.mockReturnValue(mockPrompt);
			repository.save.mockResolvedValue(mockPrompt);

			const result = await service.create(createPromptDto, userId);

			expect(repository.create).toHaveBeenCalledWith({
				...createPromptDto,
				created_by: { id: userId },
			});
			expect(repository.save).toHaveBeenCalledWith(mockPrompt);
			expect(result).toEqual(mockPrompt);
		});
	});

	describe('findAll', () => {
		it('should return all prompts with relations', async () => {
			const mockPrompts = [
				{ id: 1, name: 'prompt1', created_by: { id: 1 } },
				{ id: 2, name: 'prompt2', created_by: { id: 1 } },
			];

			repository.find.mockResolvedValue(mockPrompts);

			const result = await service.findAll();

			expect(repository.find).toHaveBeenCalledWith({
				relations: ['created_by'],
				order: { created_at: 'DESC' },
			});
			expect(result).toEqual(mockPrompts);
		});
	});

	describe('findPublic', () => {
		it('should return only public prompts', async () => {
			const mockPublicPrompts = [
				{ id: 1, name: 'public_prompt1', is_public: true },
				{ id: 2, name: 'public_prompt2', is_public: true },
			];

			repository.find.mockResolvedValue(mockPublicPrompts);

			const result = await service.findPublic();

			expect(repository.find).toHaveBeenCalledWith({
				where: { is_public: true },
				relations: ['created_by'],
				order: { created_at: 'DESC' },
			});
			expect(result).toEqual(mockPublicPrompts);
		});
	});

	describe('findOne', () => {
		it('should return a specific prompt by id', async () => {
			const promptId = 1;
			const mockPrompt = { id: 1, name: 'test_prompt' };

			repository.findOne.mockResolvedValue(mockPrompt);

			const result = await service.findOne(promptId);

			expect(repository.findOne).toHaveBeenCalledWith({
				where: { id: promptId },
				relations: ['created_by'],
			});
			expect(result).toEqual(mockPrompt);
		});

		it('should return null when prompt not found', async () => {
			const promptId = 999;

			repository.findOne.mockResolvedValue(null);

			const result = await service.findOne(promptId);

			expect(repository.findOne).toHaveBeenCalledWith({
				where: { id: promptId },
				relations: ['created_by'],
			});
			expect(result).toBeNull();
		});
	});

	describe('findByName', () => {
		it('should return a prompt by name', async () => {
			const promptName = 'test_prompt';
			const mockPrompt = { id: 1, name: promptName };

			repository.findOne.mockResolvedValue(mockPrompt);

			const result = await service.findByName(promptName);

			expect(repository.findOne).toHaveBeenCalledWith({
				where: { name: promptName },
				relations: ['created_by'],
			});
			expect(result).toEqual(mockPrompt);
		});
	});

	describe('update', () => {
		it('should update a prompt', async () => {
			const promptId = 1;
			const updatePromptDto: UpdatePromptDto = {
				name: 'updated_prompt',
				description: 'Updated description',
			};
			const updatedPrompt = { id: 1, ...updatePromptDto };

			repository.update.mockResolvedValue({ affected: 1 });
			repository.findOne.mockResolvedValue(updatedPrompt);

			const result = await service.update(promptId, updatePromptDto);

			expect(repository.update).toHaveBeenCalledWith(
				promptId,
				updatePromptDto,
			);
			expect(repository.findOne).toHaveBeenCalledWith({
				where: { id: promptId },
				relations: ['created_by'],
			});
			expect(result).toEqual(updatedPrompt);
		});
	});

	describe('remove', () => {
		it('should delete a prompt', async () => {
			const promptId = 1;

			repository.delete.mockResolvedValue({ affected: 1 });

			await service.remove(promptId);

			expect(repository.delete).toHaveBeenCalledWith(promptId);
		});
	});
});
