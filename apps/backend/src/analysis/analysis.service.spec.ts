import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AnalysisService } from './analysis.service';
import { AnalysisResult } from './schemas/analysis-result.schema';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let mockAnalysisModel: any;

  const mockAnalysisModelInstance = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    sort: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: getModelToken(AnalysisResult.name),
          useValue: mockAnalysisModelInstance,
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
    mockAnalysisModel = module.get(getModelToken(AnalysisResult.name));

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockCreateAnalysisDto: CreateAnalysisDto = {
      creator_id: 123,
      platform: 'discord',
      prompt_key: 'test_prompt',
      llm_model: 'gpt-4',
      scope: {
        server_id: 'server123',
        channel_id: 'channel456',
      },
      period: {
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      },
      result: {
        choices: [{ message: { content: 'Analysis result' } }],
      },
    };

    it('should create a new analysis', async () => {
      const expectedResult = { id: 'analysis123', ...mockCreateAnalysisDto };
      mockAnalysisModel.create.mockResolvedValue(expectedResult);

      const result = await service.create(mockCreateAnalysisDto);

      expect(mockAnalysisModel.create).toHaveBeenCalledWith(mockCreateAnalysisDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle creation errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.create.mockRejectedValue(error);

      await expect(service.create(mockCreateAnalysisDto)).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all analyses', async () => {
      const expectedResult = [
        { id: 'analysis1', platform: 'discord' },
        { id: 'analysis2', platform: 'discord' },
      ];
      mockAnalysisModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedResult),
      });

      const result = await service.findAll();

      expect(mockAnalysisModel.find).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle find all errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOne', () => {
    it('should find analysis by id', async () => {
      const expectedResult = { id: 'analysis123', platform: 'discord' };
      mockAnalysisModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedResult),
      });

      const result = await service.findOne(123);

      expect(mockAnalysisModel.findById).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedResult);
    });

    it('should handle find one errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findOne(123)).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find analysis by string id', async () => {
      const expectedResult = { id: 'analysis123', platform: 'discord' };
      mockAnalysisModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedResult),
      });

      const result = await service.findById('analysis123');

      expect(mockAnalysisModel.findById).toHaveBeenCalledWith('analysis123');
      expect(result).toEqual(expectedResult);
    });

    it('should handle findById errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.findById.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.findById('analysis123')).rejects.toThrow('Database error');
    });
  });

  describe('findByDiscordScope', () => {
    it('should find analysis by Discord scope', async () => {
      const expectedResult = { id: 'analysis123', platform: 'discord' };
      mockAnalysisModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(expectedResult),
        }),
      });

      const result = await service.findByDiscordScope('server123', 'channel456', 'test_prompt');

      expect(mockAnalysisModel.findOne).toHaveBeenCalledWith({
        platform: 'discord',
        scope: {
          server_id: 'server123',
          channel_id: 'channel456',
        },
        prompt_key: { $eq: 'test_prompt' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for invalid promptKey type', () => {
      expect(() => service.findByDiscordScope('server123', 'channel456', 123 as any)).toThrow(
        'Invalid promptKey: must be a string',
      );
    });

    it('should handle findByDiscordScope errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockRejectedValue(error),
        }),
      });

      await expect(service.findByDiscordScope('server123', 'channel456', 'test_prompt')).rejects.toThrow('Database error');
    });
  });

  describe('findByDiscordServer', () => {
    it('should find analyses by Discord server', async () => {
      const expectedResult = [
        { id: 'analysis1', platform: 'discord' },
        { id: 'analysis2', platform: 'discord' },
      ];
      mockAnalysisModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(expectedResult),
            }),
          }),
        }),
      });

      const result = await service.findByDiscordServer('server123', 'test_prompt');

      expect(mockAnalysisModel.find).toHaveBeenCalledWith({
        platform: 'discord',
        'scope.server_id': 'server123',
        prompt_key: { $eq: 'test_prompt' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw error for invalid promptKey type', () => {
      expect(() => service.findByDiscordServer('server123', 123 as any)).toThrow(
        'Invalid promptKey: must be a string',
      );
    });

    it('should handle findByDiscordServer errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockReturnValue({
              exec: jest.fn().mockRejectedValue(error),
            }),
          }),
        }),
      });

      await expect(service.findByDiscordServer('server123', 'test_prompt')).rejects.toThrow('Database error');
    });
  });

  describe('update', () => {
    const mockUpdateAnalysisDto: UpdateAnalysisDto = {
      platform: 'discord',
      prompt_key: 'updated_prompt',
    };

    it('should update analysis by id', async () => {
      const expectedResult = { id: 'analysis123', ...mockUpdateAnalysisDto };
      mockAnalysisModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedResult),
      });

      const result = await service.update(123, mockUpdateAnalysisDto);

      expect(mockAnalysisModel.findByIdAndUpdate).toHaveBeenCalledWith(123, mockUpdateAnalysisDto, { new: true });
      expect(result).toEqual(expectedResult);
    });

    it('should handle update errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.update(123, mockUpdateAnalysisDto)).rejects.toThrow('Database error');
    });
  });

  describe('remove', () => {
    it('should remove analysis by id', async () => {
      const expectedResult = { id: 'analysis123', deleted: true };
      mockAnalysisModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(expectedResult),
      });

      const result = await service.remove(123);

      expect(mockAnalysisModel.findByIdAndDelete).toHaveBeenCalledWith(123);
      expect(result).toEqual(expectedResult);
    });

    it('should handle remove errors', async () => {
      const error = new Error('Database error');
      mockAnalysisModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockRejectedValue(error),
      });

      await expect(service.remove(123)).rejects.toThrow('Database error');
    });
  });

  describe('query chain methods', () => {
    it('should properly chain sort, limit, lean, and exec methods', async () => {
      const mockSort = jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      mockAnalysisModel.find.mockReturnValue({
        sort: mockSort,
      });

      await service.findByDiscordServer('server123', 'test_prompt');

      expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
      expect(mockSort().limit).toHaveBeenCalledWith(10);
      expect(mockSort().limit().lean).toHaveBeenCalled();
      expect(mockSort().limit().lean().exec).toHaveBeenCalled();
    });

    it('should properly chain sort and lean methods for findByDiscordScope', async () => {
      const mockSort = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      mockAnalysisModel.findOne.mockReturnValue({
        sort: mockSort,
      });

      await service.findByDiscordScope('server123', 'channel456', 'test_prompt');

      expect(mockSort).toHaveBeenCalledWith({ created_at: -1 });
      expect(mockSort().lean).toHaveBeenCalled();
    });
  });
});
