import { Test, TestingModule } from '@nestjs/testing';
import { Logger, HttpException, HttpStatus, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { AnalysisProvider } from './analysis.provider';
import { DiscordMessageService } from '../discord/services/discord-message.service';
import { AnalysisHelper } from './analysis.helper';
import { AnalysisService } from './analysis.service';
import { DiscordAnalyzeDto, AnalyzePeriod } from './dto/discord-analyse.dto';

describe('AnalysisProvider', () => {
  let provider: AnalysisProvider;
  let discordMessageService: jest.Mocked<DiscordMessageService>;
  let analysisHelper: jest.Mocked<AnalysisHelper>;
  let analysisService: jest.Mocked<AnalysisService>;

  const mockDiscordMessageService = {
    findMessagesInRange: jest.fn(),
  } as any;

  const mockAnalysisHelper = {

    saveAnalysis: jest.fn(),
    trendToContent: jest.fn(),
  } as any;

  const mockAnalysisService = {
    findByDiscordServer: jest.fn(),
    findByDiscordScope: jest.fn(),
    findById: jest.fn(),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisProvider,
        { provide: DiscordMessageService, useValue: mockDiscordMessageService },
        { provide: AnalysisHelper, useValue: mockAnalysisHelper },
        { provide: AnalysisService, useValue: mockAnalysisService },
      ],
    }).compile();

    provider = module.get<AnalysisProvider>(AnalysisProvider);
    discordMessageService = module.get(DiscordMessageService);
    analysisHelper = module.get(AnalysisHelper);
    analysisService = module.get(AnalysisService);
    jest.clearAllMocks();
  });

  describe('analyzeDiscord', () => {
    const mockDto: DiscordAnalyzeDto = {
      channelId: '123456789',
      serverId: 987654321,
      period: AnalyzePeriod.LAST_DAY,
      model_name: 'gpt-4',
      prompt_key: 'discord_analysis',
      creator_id: 123,
    };

    const mockMessages = [
      {
        content: 'Hello world',
        author_name: 'User1',
        user_id: '123',
        created_at_by_discord: '2024-01-01T10:00:00Z',
      },
      {
        content: 'How are you?',
        author_name: 'User2',
        user_id: '456',
        created_at_by_discord: '2024-01-01T11:00:00Z',
      },
    ];

    const mockLlmResponse = {
      choices: [{ message: { content: 'Analysis result' } }],
    };

    const mockSavedAnalysis = {
      id: 'analysis123',
      result: mockLlmResponse,
    };


        promptKey: mockDto.prompt_key,
        userContent: expect.arrayContaining([
          expect.stringContaining('[2024-01-01 12:00] User1: Test message'),
        ]),
      });
    });

    it('should handle messages with neither author_name nor user_id', async () => {
      const messagesWithoutUser = [
        {
          content: 'Test message',
          created_at_by_discord: '2024-01-01T10:00:00Z',
        },
      ];


    });
  });

  describe('findByScope', () => {
    const mockFindAnalysis = {
      platform: 'discord',
      scope: {
        serverId: 'server123',
        channelId: 'channel456',
      },
      promptKey: 'test_prompt',
    };

    it('should find by Discord scope when channelId is provided', async () => {
      const expectedResult = [{ id: 'analysis1' }] as any;
      analysisService.findByDiscordScope.mockResolvedValue(expectedResult);

      const result = await provider.findByScope(mockFindAnalysis);

      expect(analysisService.findByDiscordScope).toHaveBeenCalledWith(
        mockFindAnalysis.scope.serverId,
        mockFindAnalysis.scope.channelId,
        mockFindAnalysis.promptKey,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should find by Discord server when channelId is not provided', async () => {
      const findAnalysisWithoutChannel = {
        ...mockFindAnalysis,
        scope: { serverId: 'server123' },
      };
      const expectedResult = [{ id: 'analysis1' }, { id: 'analysis2' }] as any;
      analysisService.findByDiscordServer.mockResolvedValue(expectedResult);

      const result = await provider.findByScope(findAnalysisWithoutChannel);

      expect(analysisService.findByDiscordServer).toHaveBeenCalledWith(
        findAnalysisWithoutChannel.scope.serverId,
        findAnalysisWithoutChannel.promptKey,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return empty array for non-Discord platforms', async () => {
      const findAnalysisOtherPlatform = {
        ...mockFindAnalysis,
        platform: 'other',
      };

      const result = await provider.findByScope(findAnalysisOtherPlatform);

      expect(result).toEqual([]);
    });
  });

  describe('trendToContent', () => {
    const mockAnalysis = {
      id: 'analysis123',
      llm_model: 'gpt-4',
      result: {
        choices: [{
          message: {
            content: JSON.stringify({
              trends: [
                {
                  title: 'Test Trend',
                  summary: 'Test Summary',
                  representative_messages: ['msg1', 'msg2'],
                  activity_level: 'high',
                },
              ],
            }),
          },
        }],
        timeframe: 'last_week',
      },
    } as any;

    const mockTrendResponse = {
      choices: [{ message: { content: 'Generated content' } }],
    };

    it('should successfully convert trend to content', async () => {
      analysisService.findById.mockResolvedValue(mockAnalysis);
      analysisHelper.trendToContent.mockResolvedValue(mockTrendResponse);

      const result = await provider.trendToContent('analysis123', 0);

      expect(analysisService.findById).toHaveBeenCalledWith('analysis123');
      expect(analysisHelper.trendToContent).toHaveBeenCalledWith({
        modelName: 'gpt-4',
        promptKey: 'trend_to_content',
        trend: {
          trend_title: 'Test Trend',
          summary: 'Test Summary',
          representative_messages: ['msg1', 'msg2'],
          activity_level: 'high',
          timeframe: 'last_week',
        },
      });
      expect(result).toEqual({
        response: mockTrendResponse,
        analysis: mockAnalysis,
        trendInput: {
          trend_title: 'Test Trend',
          summary: 'Test Summary',
          representative_messages: ['msg1', 'msg2'],
          activity_level: 'high',
          timeframe: 'last_week',
        },
        trendIndex: 0,
        selectedTrend: JSON.parse(mockAnalysis.result.choices[0].message.content).trends[0],
      });
    });

    it('should throw BadRequestException for invalid analyse_id format', async () => {
      analysisService.findById.mockRejectedValue(new Error('Invalid ID'));

      await expect(provider.trendToContent('invalid-id')).rejects.toThrow(
        new BadRequestException('Invalid analyse_id format'),
      );
    });

    it('should throw NotFoundException when analysis not found', async () => {
      analysisService.findById.mockResolvedValue(null);

      await expect(provider.trendToContent('analysis123')).rejects.toThrow(
        new NotFoundException('Analyse not found'),
      );
    });

    it('should throw InternalServerErrorException when LLM content parsing fails', async () => {
      const invalidAnalysis = {
        ...mockAnalysis,
        result: {
          choices: [{ message: { content: 'invalid json' } }],
        },
      } as any;
      analysisService.findById.mockResolvedValue(invalidAnalysis);

      await expect(provider.trendToContent('analysis123')).rejects.toThrow(
        new InternalServerErrorException('Failed to parse LLM analysis content'),
      );
    });

    it('should throw BadRequestException when no trends found', async () => {
      const analysisWithoutTrends = {
        ...mockAnalysis,
        result: {
          choices: [{
            message: {
              content: JSON.stringify({ trends: [] }),
            },
          }],
        },
      } as any;
      analysisService.findById.mockResolvedValue(analysisWithoutTrends);

      await expect(provider.trendToContent('analysis123')).rejects.toThrow(
        new BadRequestException('No trends found in the analysis result'),
      );
    });

    it('should throw BadRequestException when trend index out of range', async () => {
      analysisService.findById.mockResolvedValue(mockAnalysis);

      await expect(provider.trendToContent('analysis123', 5)).rejects.toThrow(
        new BadRequestException('Trend index 5 out of range. Only 1 trend(s) available.'),
      );
    });

    it('should throw InternalServerErrorException when LLM call fails', async () => {
      analysisService.findById.mockResolvedValue(mockAnalysis);
      analysisHelper.trendToContent.mockRejectedValue(new Error('LLM error'));

      await expect(provider.trendToContent('analysis123')).rejects.toThrow(
        new InternalServerErrorException('LLM error: Error: LLM error'),
      );
    });

    it('should use default trend index 0 when not provided', async () => {
      analysisService.findById.mockResolvedValue(mockAnalysis);
      analysisHelper.trendToContent.mockResolvedValue(mockTrendResponse);

      await provider.trendToContent('analysis123');

      expect(analysisHelper.trendToContent).toHaveBeenCalledWith({
        modelName: 'gpt-4',
        promptKey: 'trend_to_content',
        trend: expect.objectContaining({
          trend_title: 'Test Trend',
        }),
      });
    });
  });

  describe('private methods', () => {
    describe('getSinceDate', () => {
      it('should return correct date for LAST_DAY', () => {
        const now = new Date('2024-01-01T12:00:00Z');
        const result = (provider as any).getSinceDate(AnalyzePeriod.LAST_DAY, now);
        const expected = new Date('2023-12-31T12:00:00Z');
        expect(result.getTime()).toBe(expected.getTime());
      });

      it('should return correct date for LAST_WEEK', () => {
        const now = new Date('2024-01-01T12:00:00Z');
        const result = (provider as any).getSinceDate(AnalyzePeriod.LAST_WEEK, now);
        const expected = new Date('2023-12-25T12:00:00Z');
        expect(result.getTime()).toBe(expected.getTime());
      });

      it('should return correct date for LAST_MONTH', () => {
        const now = new Date('2024-01-01T12:00:00Z');
        const result = (provider as any).getSinceDate(AnalyzePeriod.LAST_MONTH, now);
        const expected = new Date('2023-12-02T12:00:00Z');
        expect(result.getTime()).toBe(expected.getTime());
      });

      it('should throw HttpException for invalid period', () => {
        const now = new Date();
        expect(() => (provider as any).getSinceDate('INVALID' as AnalyzePeriod, now)).toThrow(
          new HttpException('Invalid period', HttpStatus.BAD_REQUEST),
        );
      });
    });

    describe('formatMessages', () => {
      it('should format messages correctly', () => {
        const messages = [
          {
            content: 'First message',
            author_name: 'User1',
            created_at_by_discord: '2024-01-01T10:00:00Z',
          },
          {
            content: 'Second message',
            author_name: 'User2',
            created_at_by_discord: '2024-01-01T09:00:00Z',
          },
        ];

        const result = (provider as any).formatMessages(messages);

        expect(result).toEqual([
          '[2024-01-01 12:00] User1: First message',
          '[2024-01-01 12:00] User2: Second message',
        ]);
      });

      it('should sort messages by creation date', () => {
        const messages = [
          {
            content: 'Later message',
            author_name: 'User1',
            created_at_by_discord: '2024-01-01T11:00:00Z',
          },
          {
            content: 'Earlier message',
            author_name: 'User2',
            created_at_by_discord: '2024-01-01T10:00:00Z',
          },
        ];

        const result = (provider as any).formatMessages(messages);

        expect(result[0]).toContain('Later message');
        expect(result[1]).toContain('Earlier message');
      });
    });
  });
}); 