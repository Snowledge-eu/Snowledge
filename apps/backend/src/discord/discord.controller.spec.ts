import 'reflect-metadata';
// Mock User entity and decorator
jest.mock('../user/entities/user.entity', () => ({
  User: class MockUser {
    id = 1;
    email = 'test@example.com';
  }
}));

jest.mock('../user/decorator', () => ({
  // Correction : mock User comme un vrai décorateur de paramètre
  User: () => (target: any, key: string | symbol, index: number) => {}
}));

// Mock problematic services
jest.mock('../user/user.service', () => ({}));
jest.mock('../community/community.service', () => ({}));
jest.mock('../discord-server/discord-server.service', () => ({}));
jest.mock('./helpers/discord-client.helper', () => ({}));
jest.mock('../config/discord.config', () => ({}));
jest.mock('../learner/entities/learner/learner', () => ({}));

import { Test, TestingModule } from '@nestjs/testing';
import { DiscordController } from './discord.controller';
import { DiscordProvider } from './discord.provider';
import { DiscordChannelService } from './services/discord-channel.service';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
import { DiscordMessageService } from './services/discord-message.service';
import { Response } from 'express';

describe('DiscordController', () => {
  let controller: DiscordController;
  let discordProvider: jest.Mocked<DiscordProvider>;
  let discordChannelService: jest.Mocked<DiscordChannelService>;
  let discordHarvestJobService: jest.Mocked<DiscordHarvestJobService>;
  let discordMessageService: jest.Mocked<DiscordMessageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscordController],
      providers: [
        {
          provide: DiscordProvider,
          useValue: {
            linkDiscord: jest.fn(),
            getLastHarvest: jest.fn(),
            listDiscordServers: jest.fn(),
            getHarvestJobStatus: jest.fn(),
            countMessageInterval: jest.fn(),
            harvestDiscord: jest.fn(),
            disconnectDiscord: jest.fn(),
          },
        },
        {
          provide: DiscordChannelService,
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: DiscordHarvestJobService,
          useValue: {
            findLastHarvestJobByDiscordServerId: jest.fn(),
          },
        },
        {
          provide: DiscordMessageService,
          useValue: {
            countMessageForDate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DiscordController>(DiscordController);
    discordProvider = module.get(DiscordProvider);
    discordChannelService = module.get(DiscordChannelService);
    discordHarvestJobService = module.get(DiscordHarvestJobService);
    discordMessageService = module.get(DiscordMessageService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /discord/link', () => {
    it('should redirect to frontend with community slug when linkDiscord succeeds', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const user = { id: 1, email: 'test@example.com' };
      const code = 'test_code';
      const state = JSON.stringify({ communityId: 123 });
      const mockCommunity = { slug: 'test-community' };

      discordProvider.linkDiscord.mockResolvedValue(mockCommunity as any);

      await controller.getVerifyToken(mockRes, user as any, code, state);

      expect(discordProvider.linkDiscord).toHaveBeenCalledWith(code, user, 123);
      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${process.env.FRONT_URL}/test-community?verify=discord`
      );
    });

    it('should redirect to profile when linkDiscord returns null', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const user = { id: 1, email: 'test@example.com' };
      const code = 'test_code';
      const state = JSON.stringify({ communityId: 123 });

      discordProvider.linkDiscord.mockResolvedValue(null);

      await controller.getVerifyToken(mockRes, user as any, code, state);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${process.env.FRONT_URL}/profile?verify=discord`
      );
    });

    it('should redirect to profile when no code provided', async () => {
      const mockRes = {
        redirect: jest.fn(),
      } as any;
      const user = { id: 1, email: 'test@example.com' };

      await controller.getVerifyToken(mockRes, user as any, '', undefined);

      expect(mockRes.redirect).toHaveBeenCalledWith(
        `${process.env.FRONT_URL}/profile`
      );
    });
  });

  describe('GET /discord/last-harvest/:guildId', () => {
    it('should return last harvest data', async () => {
      const guildId = 'guild123';
      const mockLastHarvest = {
        created_at: new Date(),
        channels: ['channel1', 'channel2'],
        lastFetched: {
          date: new Date(),
          channels: [
            { name: 'Channel 1', qty: 10 },
            { name: 'Channel 2', qty: 20 },
          ],
        },
      };

      discordProvider.getLastHarvest.mockResolvedValue(mockLastHarvest);

      const result = await controller.getLastHarvest(guildId);

      expect(discordProvider.getLastHarvest).toHaveBeenCalledWith(guildId);
      expect(result).toEqual(mockLastHarvest);
    });
  });

  describe('GET /discord/servers', () => {
    it('should return list of Discord servers', async () => {
      const mockServers = [
        { id: 'server1', name: 'Server 1' },
        { id: 'server2', name: 'Server 2' },
      ];

      discordProvider.listDiscordServers.mockResolvedValue(mockServers);

      const result = await controller.listDiscordServers();

      expect(discordProvider.listDiscordServers).toHaveBeenCalled();
      expect(result).toEqual(mockServers);
    });
  });

  describe('GET /discord/harvest/status/:jobId', () => {
    it('should return harvest job status', async () => {
      const jobId = 'job123';
      const mockStatus = {
        job_id: 'job123',
        status: 'completed',
        inserted: 100,
        finished_at: new Date(),
        error: null,
      };

      discordProvider.getHarvestJobStatus.mockResolvedValue(mockStatus);

      const result = await controller.getHarvestJobStatus(jobId);

      expect(discordProvider.getHarvestJobStatus).toHaveBeenCalledWith(jobId);
      expect(result).toEqual(mockStatus);
    });

    it('should return error object when exception occurs', async () => {
      const jobId = 'invalid-job';
      const errorMessage = 'Invalid job_id format';

      discordProvider.getHarvestJobStatus.mockRejectedValue(new Error(errorMessage));

      const result = await controller.getHarvestJobStatus(jobId);

      expect(discordProvider.getHarvestJobStatus).toHaveBeenCalledWith(jobId);
      expect(result).toEqual({ error: errorMessage });
    });
  });

  describe('POST /discord/count-message', () => {
    it('should return message count for specified interval', async () => {
      const info = {
        channelId: ['channel1', 'channel2'],
        interval: 'last_day' as const,
      };
      const expectedCount = 150;

      discordProvider.countMessageInterval.mockResolvedValue(expectedCount);

      const result = await controller.countMessageInterval(info);

      expect(discordProvider.countMessageInterval).toHaveBeenCalledWith(info);
      expect(result).toBe(expectedCount);
    });
  });

  describe('POST /discord/harvest', () => {
    it('should start Discord harvest', async () => {
      const dto = { guildId: 'guild123', channels: ['channel1'] };
      const mockResult = {
        job_id: 'job123',
        status: 'started',
      };

      discordProvider.harvestDiscord.mockResolvedValue(mockResult);

      const result = await controller.harvestDiscord(dto);

      expect(discordProvider.harvestDiscord).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('DELETE /discord/disconnect', () => {
    it('should disconnect Discord account', async () => {
      const user = { id: 1, email: 'test@example.com' };

      discordProvider.disconnectDiscord.mockResolvedValue(undefined);

      const result = await controller.disconnect(user as any);

      expect(discordProvider.disconnectDiscord).toHaveBeenCalledWith(user);
      expect(result).toBeUndefined();
    });
  });
});
