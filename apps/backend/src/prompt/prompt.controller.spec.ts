import { Test, TestingModule } from '@nestjs/testing';
import { PromptController } from './prompt.controller';
import { PromptProvider } from './prompt.provider';
import { CreatePromptDto } from './dto/create-prompt.dto';
import { UpdatePromptDto } from './dto/update-prompt.dto';
import { TestAnalysisDto } from './dto/test-analysis.dto';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

// Mock des guards
jest.mock('../auth/auth.guard');
jest.mock('../auth/admin.guard');

describe('PromptController', () => {
	let controller: PromptController;
	let provider: PromptProvider;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [PromptController],
			providers: [
				{
					provide: PromptProvider,
					useValue: {
						createPrompt: jest.fn(),
						getAllPrompts: jest.fn(),
						getPrompt: jest.fn(),
						updatePrompt: jest.fn(),
						deletePrompt: jest.fn(),
						migrateYamlPrompts: jest.fn(),
						testAnalysis: jest.fn(),
					},
				},
			],
		})
			.overrideGuard(AuthGuard)
			.useValue({ canActivate: () => true })
			.overrideGuard(AdminGuard)
			.useValue({ canActivate: () => true })
			.compile();

		controller = module.get<PromptController>(PromptController);
		provider = module.get<PromptProvider>(PromptProvider);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
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
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };

			const expectedResult = {
				id: 1,
				...createPromptDto,
				created_by: mockUser,
				created_at: new Date(),
				updated_at: new Date(),
			};

			jest.spyOn(provider, 'createPrompt').mockResolvedValue(
				expectedResult,
			);

			const result = await controller.create(
				createPromptDto,
				mockRequest,
			);

			expect(provider.createPrompt).toHaveBeenCalledWith(
				createPromptDto,
				mockUser,
			);
			expect(result).toEqual(expectedResult);
		});
	});

	describe('findAll', () => {
		it('should return all prompts', async () => {
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };
			const expectedPrompts = [
				{ id: 1, name: 'prompt1' },
				{ id: 2, name: 'prompt2' },
			];

			jest.spyOn(provider, 'getAllPrompts').mockResolvedValue(
				expectedPrompts,
			);

			const result = await controller.findAll(mockRequest);

			expect(provider.getAllPrompts).toHaveBeenCalledWith(mockUser);
			expect(result).toEqual(expectedPrompts);
		});
	});

	describe('findOne', () => {
		it('should return a specific prompt', async () => {
			const promptId = '1';
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };
			const expectedPrompt = { id: 1, name: 'test_prompt' };

			jest.spyOn(provider, 'getPrompt').mockResolvedValue(expectedPrompt);

			const result = await controller.findOne(promptId, mockRequest);

			expect(provider.getPrompt).toHaveBeenCalledWith(1, mockUser);
			expect(result).toEqual(expectedPrompt);
		});
	});

	describe('update', () => {
		it('should update a prompt', async () => {
			const promptId = '1';
			const updatePromptDto: UpdatePromptDto = {
				name: 'updated_prompt',
				description: 'Updated description',
			};
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };
			const expectedResult = { id: 1, ...updatePromptDto };

			jest.spyOn(provider, 'updatePrompt').mockResolvedValue(
				expectedResult,
			);

			const result = await controller.update(
				promptId,
				updatePromptDto,
				mockRequest,
			);

			expect(provider.updatePrompt).toHaveBeenCalledWith(
				1,
				updatePromptDto,
				mockUser,
			);
			expect(result).toEqual(expectedResult);
		});
	});

	describe('remove', () => {
		it('should delete a prompt', async () => {
			const promptId = '1';
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };

			jest.spyOn(provider, 'deletePrompt').mockResolvedValue(undefined);

			await controller.remove(promptId, mockRequest);

			expect(provider.deletePrompt).toHaveBeenCalledWith(1, mockUser);
		});
	});

	describe('testAnalysis', () => {
		it('should test analysis with prompt and community', async () => {
			const testAnalysisDto: TestAnalysisDto = {
				prompt_name: 'test_prompt',
				community_id: '1',
				model_name: 'Llama-3.1-8B-Instruct',
			};
			const mockUser = { id: 1, isAdmin: true };
			const mockRequest = { user: mockUser };
			const expectedResult = {
				analysis_id: 'test_analysis_123',
				prompt_used: 'test_prompt',
				community: 'Test Community',
				message_count: 50,
				result: { analysis: 'Test result' },
			};

			jest.spyOn(provider, 'testAnalysis').mockResolvedValue(
				expectedResult,
			);

			const result = await controller.testAnalysis(
				testAnalysisDto,
				mockRequest,
			);

			expect(provider.testAnalysis).toHaveBeenCalledWith(
				testAnalysisDto,
				mockUser,
			);
			expect(result).toEqual(expectedResult);
		});
	});
});
