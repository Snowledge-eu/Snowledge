import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiscordChannelService } from './discord-channel.service';
import { DiscordChannel } from '../schemas/discord-channel.schema';
import { Long } from 'bson';

describe('DiscordChannelService', () => {
  let service: DiscordChannelService;
  let mockModel: jest.Mocked<Model<DiscordChannel>>;

  const mockChannel = {
    _id: '123456789',
    name: 'test-channel',
    channel_id: Long.fromString('123456789'),
  };

  beforeEach(async () => {
    const mockModelInstance = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordChannelService,
        {
          provide: getModelToken(DiscordChannel.name),
          useValue: mockModelInstance,
        },
      ],
    }).compile();

    service = module.get<DiscordChannelService>(DiscordChannelService);
    mockModel = module.get(getModelToken(DiscordChannel.name));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all channels', async () => {
      const mockChannels = [mockChannel, { ...mockChannel, _id: '987654321', name: 'another-channel' }];
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockChannels),
        }),
      } as any);

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockChannels);
    });

    it('should return empty array when no channels found', async () => {
      mockModel.find.mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const result = await service.findAll();

      expect(mockModel.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should find channel by string id', async () => {
      const channelId = '123456789';
      mockModel.findOne.mockReturnValue({
        setOptions: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockChannel),
          }),
        }),
      } as any);

      const result = await service.findOne(channelId);

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: Long.fromString(channelId) });
      expect(result).toEqual(mockChannel);
    });

    it('should find channel by Long id', async () => {
      const channelId = Long.fromString('123456789');
      mockModel.findOne.mockReturnValue({
        setOptions: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockChannel),
          }),
        }),
      } as any);

      const result = await service.findOne(channelId.toString());

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: channelId });
      expect(result).toEqual(mockChannel);
    });

    it('should return null when channel not found', async () => {
      const channelId = '999999999';
      mockModel.findOne.mockReturnValue({
        setOptions: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      } as any);

      const result = await service.findOne(channelId);

      expect(mockModel.findOne).toHaveBeenCalledWith({ _id: Long.fromString(channelId) });
      expect(result).toBeNull();
    });
  });
}); 