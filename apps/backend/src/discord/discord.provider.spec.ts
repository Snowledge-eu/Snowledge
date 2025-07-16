import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { DiscordProvider } from './discord.provider';
import { DiscordService } from './services/discord.service';
import { UserService } from '../user/user.service';
import { CommunityService } from '../community/community.service';
import { DiscordServerService } from '../discord-server/discord-server.service';
import { DiscordClientHelper } from './helpers/discord-client.helper';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
import { DiscordChannelService } from './services/discord-channel.service';
import { DiscordMessageService } from './services/discord-message.service';
import discordConfig from '../config/discord.config';
import { ConfigType } from '@nestjs/config';

const mockDiscordService = { createDiscordAccess: jest.fn(), delete: jest.fn() };
const mockUserService = { update: jest.fn(), findOneByEmail: jest.fn() };
const mockCommunityService = { updateDiscordGuildId: jest.fn() };
const mockDiscordServerService = { create: jest.fn() };
const mockDiscordClientHelper = { getClient: jest.fn() };
const mockDiscordHarvestJobService = { findLastHarvestJobByDiscordServerId: jest.fn(), addJob: jest.fn(), harvestJobModel: { findById: jest.fn() } };
const mockDiscordChannelService = { findOne: jest.fn() };
const mockDiscordMessageService = { countMessageForDate: jest.fn(), countMessageForPeriod: jest.fn() };
const mockConfigDiscord: ConfigType<typeof discordConfig> = {
  clientId: 'test-client-id',
  clientSecret: 'test-client-secret',
  redirect: 'http://localhost/redirect',
};

global.fetch = jest.fn();

describe('DiscordProvider', () => {
  let provider: DiscordProvider;

  beforeEach(async () => {
    (global.fetch as jest.Mock).mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordProvider,
        { provide: discordConfig.KEY, useValue: mockConfigDiscord },
        { provide: DiscordService, useValue: mockDiscordService },
        { provide: UserService, useValue: mockUserService },
        { provide: CommunityService, useValue: mockCommunityService },
        { provide: DiscordServerService, useValue: mockDiscordServerService },
        { provide: DiscordClientHelper, useValue: mockDiscordClientHelper },
        { provide: DiscordHarvestJobService, useValue: mockDiscordHarvestJobService },
        { provide: DiscordChannelService, useValue: mockDiscordChannelService },
        { provide: DiscordMessageService, useValue: mockDiscordMessageService },
      ],
    }).compile();
    provider = module.get<DiscordProvider>(DiscordProvider);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should have all main methods', () => {
    expect(typeof provider.linkDiscord).toBe('function');
    expect(typeof provider.disconnectDiscord).toBe('function');
    expect(typeof provider.listDiscordServers).toBe('function');
    expect(typeof provider.getHarvestJobStatus).toBe('function');
    expect(typeof provider.getLastHarvest).toBe('function');
    expect(typeof provider.countMessageInterval).toBe('function');
    expect(typeof provider.harvestDiscord).toBe('function');
  });

  // Ajoute ici un test simple pour chaque méthode (mocké)
  it('linkDiscord should handle error if fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fetch error'));
    const result = await provider.linkDiscord('code', { id: 1 } as any, 123);
    expect(result).toBeUndefined();
  });

  it('disconnectDiscord should call userService.update', async () => {
    mockUserService.findOneByEmail.mockResolvedValue({ discordAccess: { id: '123' } });
    await provider.disconnectDiscord({ id: 1, email: 'test@example.com' } as any);
    expect(mockUserService.update).toHaveBeenCalled();
    expect(mockDiscordService.delete).toHaveBeenCalledWith('123');
  });

  it('listDiscordServers should return guilds', async () => {
    mockDiscordClientHelper.getClient.mockReturnValue({ guilds: { cache: [{ id: '1', name: 'A' }, { id: '2', name: 'B' }] } });
    const result = await provider.listDiscordServers();
    expect(result).toEqual([{ id: '1', name: 'A' }, { id: '2', name: 'B' }]);
  });

  it('getHarvestJobStatus should throw if job not found', async () => {
    mockDiscordHarvestJobService.harvestJobModel.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    await expect(provider.getHarvestJobStatus('507f1f77bcf86cd799439011')).rejects.toThrow('Job not found');
  });

  it('getLastHarvest should return null if no last job', async () => {
    mockDiscordHarvestJobService.findLastHarvestJobByDiscordServerId.mockResolvedValue(null);
    const result = await provider.getLastHarvest('guildId');
    expect(result).toBeNull();
  });

  it('countMessageInterval should sum message counts', async () => {
    mockDiscordMessageService.countMessageForPeriod.mockResolvedValue(2);
    const result = await provider.countMessageInterval({ channelId: ['a', 'b'], interval: 'last_day' });
    expect(result).toBe(4);
  });

  it('harvestDiscord should return job_id and status', async () => {
    mockDiscordHarvestJobService.addJob.mockResolvedValue('jobid');
    const result = await provider.harvestDiscord({ foo: 'bar' });
    expect(result).toEqual({ job_id: 'jobid', status: 'queued' });
  });
}); 