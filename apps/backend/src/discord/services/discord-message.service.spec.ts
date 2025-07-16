import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscordMessageService } from './discord-message.service';
import { DiscordMessage } from '../schemas/discord-message.schema';
import { Long } from 'bson';

describe('DiscordMessageService', () => {
  let service: DiscordMessageService;
  let mockModel: jest.Mocked<Model<DiscordMessage>>;

  const mockMessage = {
    _id: '123456789',
    channel_id: Long.fromString('123456789'),
    content: 'test message',
    created_at_by_discord: new Date(),
  };

  beforeEach(async () => {
    const mockModelInstance = {
      find: jest.fn(),
      aggregate: jest.fn(),
      countDocuments: jest.fn(),
      distinct: jest.fn(),
      insertMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordMessageService,
        {
          provide: getModelToken(DiscordMessage.name),
          useValue: mockModelInstance,
        },
      ],
    }).compile();

    service = module.get<DiscordMessageService>(DiscordMessageService);
    mockModel = module.get(getModelToken(DiscordMessage.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all messages', async () => {
      const mockMessages = [mockMessage, { ...mockMessage, _id: '987654321' }];
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMessages),
        }),
      } as any);

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockMessages);
    });
  });

  describe('findAllById', () => {
    it('should find messages by string channel id', async () => {
      const channelId = '123456789';
      const mockMessages = [mockMessage];
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMessages),
      } as any);

      const result = await service.findAllById(channelId);

      expect(mockModel.find).toHaveBeenCalledWith({ channel_id: Long.fromString(channelId) });
      expect(result).toEqual(mockMessages);
    });

    it('should find messages by Long channel id', async () => {
      const channelId = Long.fromString('123456789');
      const mockMessages = [mockMessage];
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockMessages),
      } as any);

      const result = await service.findAllById(channelId);

      expect(mockModel.find).toHaveBeenCalledWith({ channel_id: channelId });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('countMessageForDate', () => {
    it('should count messages for a specific date', async () => {
      const channelId = '123456789';
      const date = new Date('2023-01-01');
      const mockAggregateResult = [{ count: 5 }];
      
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggregateResult),
      } as any);

      const result = await service.countMessageForDate(channelId, date);

      expect(mockModel.aggregate).toHaveBeenCalledWith([
        { $match: { channel_id: Long.fromString(channelId) } },
        { $match: { $expr: { $eq: [{ $dateTrunc: { date: "$created_at_by_discord", unit: "day" } }, { $dateTrunc: { date: date, unit: "day" } }] } } },
        { $count: "count" }
      ]);
      expect(result).toBe(5);
    });

    it('should return 0 when no messages found', async () => {
      const channelId = '123456789';
      const date = new Date('2023-01-01');
      
      mockModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      } as any);

      const result = await service.countMessageForDate(channelId, date);

      expect(result).toBe(0);
    });
  });

  describe('findMessagesInRange', () => {
    it('should find messages in date range', async () => {
      const channelId = '123456789';
      const from = new Date('2023-01-01');
      const to = new Date('2023-01-31');
      const mockMessages = [mockMessage];

      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockMessages),
        }),
      } as any);

      const result = await service.findMessagesInRange(channelId, from, to);

      expect(mockModel.find).toHaveBeenCalledWith({
        channel_id: Long.fromString(channelId),
        created_at_by_discord: { $gte: from, $lte: to }
      });
      expect(result).toEqual(mockMessages);
    });
  });

  describe('countMessageForPeriod', () => {
    it('should count messages for a period', async () => {
      const channelId = '123456789';
      const startDate = new Date('2023-01-01');
      const now = new Date();

      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(10),
      } as any);

      const result = await service.countMessageForPeriod(channelId, startDate);

      expect(mockModel.countDocuments).toHaveBeenCalledWith({
        channel_id: Long.fromString(channelId),
        created_at_by_discord: { $gte: startDate, $lte: now }
      });
      expect(result).toBe(10);
    });
  });

  describe('findHarvestedChannelIds', () => {
    it('should return harvested channel ids', async () => {
      const channelIds = ['123456789', '987654321'];
      const mockDistinctResult = [Long.fromString('123456789')];

      mockModel.distinct.mockResolvedValue(mockDistinctResult);

      const result = await service.findHarvestedChannelIds(channelIds);

      expect(mockModel.distinct).toHaveBeenCalledWith('channel_id', {
        channel_id: { $in: [Long.fromString('123456789'), Long.fromString('987654321')] }
      });
      expect(result).toEqual(['123456789']);
    });
  });

  describe('saveIfNew', () => {
    it('should save new messages and return count', async () => {
      const messages = [
        { id: '1', content: 'message 1' },
        { id: '2', content: 'message 2' },
        { id: '3', content: 'message 3' }
      ];
      const existingMessages = [{ _id: '1' }];

      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingMessages),
        }),
      } as any);
      mockModel.insertMany.mockResolvedValue([]);

      const result = await service.saveIfNew(messages);

      expect(mockModel.find).toHaveBeenCalledWith({ _id: { $in: ['1', '2', '3'] } }, { _id: 1 });
      expect(mockModel.insertMany).toHaveBeenCalledWith([
        { id: '2', content: 'message 2', _id: '2' },
        { id: '3', content: 'message 3', _id: '3' }
      ]);
      expect(result).toBe(2);
    });

    it('should return 0 when no new messages', async () => {
      const messages = [
        { id: '1', content: 'message 1' },
        { id: '2', content: 'message 2' }
      ];
      const existingMessages = [{ _id: '1' }, { _id: '2' }];

      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingMessages),
        }),
      } as any);

      const result = await service.saveIfNew(messages);

      expect(mockModel.insertMany).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });

    it('should return 0 when no messages provided', async () => {
      const result = await service.saveIfNew([]);

      expect(mockModel.find).not.toHaveBeenCalled();
      expect(mockModel.insertMany).not.toHaveBeenCalled();
      expect(result).toBe(0);
    });
  });
}); 