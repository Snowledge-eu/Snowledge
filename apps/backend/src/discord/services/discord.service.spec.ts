import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscordService } from './discord.service';
import { DiscordAccess } from '../entities/discord-access.entity';
import { CreateDiscordAccessDto } from '../dto/create-discord-access.dto';

describe('DiscordService', () => {
  let service: DiscordService;
  let mockRepository: jest.Mocked<Repository<DiscordAccess>>;

  const mockDiscordAccess = {
    id: 1,
    accessToken: 'test-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    refreshToken: 'refresh-token',
    scope: 'bot identify guilds email',
  };

  const mockCreateDiscordAccessDto: CreateDiscordAccessDto = {
    accessToken: 'test-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    refreshToken: 'refresh-token',
    scope: 'bot identify guilds email',
  };

  beforeEach(async () => {
    const mockRepositoryInstance = {
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: getRepositoryToken(DiscordAccess),
          useValue: mockRepositoryInstance,
        },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
    mockRepository = module.get(getRepositoryToken(DiscordAccess));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDiscordAccess', () => {
    it('should create and save a discord access', async () => {
      mockRepository.create.mockReturnValue(mockDiscordAccess as DiscordAccess);
      mockRepository.save.mockResolvedValue(mockDiscordAccess as DiscordAccess);

      const result = await service.createDiscordAccess(mockCreateDiscordAccessDto);

      expect(mockRepository.create).toHaveBeenCalledWith(mockCreateDiscordAccessDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockDiscordAccess);
      expect(result).toEqual(mockDiscordAccess);
    });

    it('should handle repository errors', async () => {
      const error = new Error('Database error');
      mockRepository.create.mockReturnValue(mockDiscordAccess as DiscordAccess);
      mockRepository.save.mockRejectedValue(error);

      await expect(service.createDiscordAccess(mockCreateDiscordAccessDto)).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    it('should delete discord access by id', async () => {
      const deleteResult = { affected: 1 };
      mockRepository.delete.mockResolvedValue(deleteResult as any);

      const result = await service.delete(1);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(deleteResult);
    });

    it('should handle delete when record not found', async () => {
      const deleteResult = { affected: 0 };
      mockRepository.delete.mockResolvedValue(deleteResult as any);

      const result = await service.delete(999);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 999 });
      expect(result).toEqual(deleteResult);
    });
  });
}); 