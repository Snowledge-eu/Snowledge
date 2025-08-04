import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisProvider } from './analysis.provider';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { AnalysisHelper } from './analysis.helper';
import { HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { DiscordAnalyzeDto, AnalyzePeriod } from './dto/discord-analyse.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let analysisProvider: jest.Mocked<AnalysisProvider>;
  let analysisService: jest.Mocked<AnalysisService>;
  let discordMessageService: jest.Mocked<DiscordMessageService>;
  let analysisHelper: jest.Mocked<AnalysisHelper>;

  beforeEach(async () => {
    const mockAnalysisProvider = {
      analyzeDiscord: jest.fn(),
      findByScope: jest.fn(),
    };

    const mockAnalysisService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const mockDiscordMessageService = {
      findMessagesInRange: jest.fn(),
    };

    const mockAnalysisHelper = {
      analyse: jest.fn(),
      trendToContent: jest.fn(),
      saveAnalysis: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        {
          provide: AnalysisProvider,
          useValue: mockAnalysisProvider,
        },
        {
          provide: AnalysisService,
          useValue: mockAnalysisService,
        },
        {
          provide: DiscordMessageService,
          useValue: mockDiscordMessageService,
        },
        {
          provide: AnalysisHelper,
          useValue: mockAnalysisHelper,
        },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
    analysisProvider = module.get(AnalysisProvider);
    analysisService = module.get(AnalysisService);
    discordMessageService = module.get(DiscordMessageService);
    analysisHelper = module.get(AnalysisHelper);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /analysis/discord', () => {
    const mockDto: DiscordAnalyzeDto = {
      creator_id: 1,
      serverId: 123456789,
      channelId: '987654321',
      model_name: 'test-model',
      prompt_key: 'test-prompt',
      period: AnalyzePeriod.LAST_DAY,
    };

    it('should successfully analyze Discord messages', async () => {
      const mockResult = { id: '1', result: 'analysis result' };
      analysisProvider.analyzeDiscord.mockResolvedValue(mockResult);

      const result = await controller.analyzeDiscord(mockDto, { set: jest.fn(), status: jest.fn() } as any);

      expect(analysisProvider.analyzeDiscord).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });

    it('should handle NO_CONTENT error correctly', async () => {
      const mockError = new HttpException('No messages found', HttpStatus.NO_CONTENT);
      analysisProvider.analyzeDiscord.mockRejectedValue(mockError);

      const mockRes = { set: jest.fn(), status: jest.fn() };
      
      await controller.analyzeDiscord(mockDto, mockRes as any);

      expect(mockRes.set).toHaveBeenCalledWith('X-Reason', 'No messages found for this period.');
      expect(mockRes.status).toHaveBeenCalledWith(HttpStatus.NO_CONTENT);
    });

    it('should rethrow other HttpExceptions', async () => {
      const mockError = new HttpException('Bad request', HttpStatus.BAD_REQUEST);
      analysisProvider.analyzeDiscord.mockRejectedValue(mockError);

      await expect(controller.analyzeDiscord(mockDto, { set: jest.fn(), status: jest.fn() } as any))
        .rejects.toThrow(mockError);
    });
  });

  describe('POST /analysis', () => {
    const mockFindDto: FindAnalysisDto = {
      platform: 'discord',
      scope: { serverId: '123', channelId: '456' },
      promptKey: 'test-prompt',
    };

    it('should find analysis by scope', async () => {
      const mockResult = [{ id: '1', platform: 'discord' }];
      analysisProvider.findByScope.mockResolvedValue(mockResult);

      const result = await controller.findByScope(mockFindDto);

      expect(analysisProvider.findByScope).toHaveBeenCalledWith(mockFindDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('GET /analysis', () => {
    it('should return all analyses', async () => {
      const mockAnalyses = [{ id: '1' }, { id: '2' }] as any;
      analysisService.findAll.mockResolvedValue(mockAnalyses);

      const result = await controller.findAll();

      expect(analysisService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockAnalyses);
    });
  });

  describe('GET /analysis/:id', () => {
    it('should return analysis by id', async () => {
      const mockAnalysis = { id: '1', platform: 'discord' } as any;
      analysisService.findOne.mockResolvedValue(mockAnalysis);

      const result = await controller.findOne('1');

      expect(analysisService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockAnalysis);
    });

    it('should throw NotFoundException when analysis not found', async () => {
      analysisService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid id format', async () => {
      analysisService.findOne.mockRejectedValue(new Error('Invalid ObjectId'));

      await expect(controller.findOne('invalid-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /analysis/:id', () => {
    const mockUpdateDto: UpdateAnalysisDto = { platform: 'discord' };

    it('should update analysis', async () => {
      const mockUpdatedAnalysis = { id: '1', platform: 'discord', updated: true } as any;
      analysisService.update.mockResolvedValue(mockUpdatedAnalysis);

      const result = await controller.update('1', mockUpdateDto);

      expect(analysisService.update).toHaveBeenCalledWith(1, mockUpdateDto);
      expect(result).toEqual(mockUpdatedAnalysis);
    });

    it('should throw NotFoundException when analysis not found', async () => {
      analysisService.update.mockResolvedValue(null);

      await expect(controller.update('1', mockUpdateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('DELETE /analysis/:id', () => {
    it('should delete analysis', async () => {
      const mockDeletedAnalysis = { id: '1', deleted: true } as any;
      analysisService.remove.mockResolvedValue(mockDeletedAnalysis);

      const result = await controller.remove('1');

      expect(analysisService.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Analysis deleted successfully' });
    });

    it('should throw NotFoundException when analysis not found', async () => {
      analysisService.remove.mockResolvedValue(null);

      await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
    });
  });
});
