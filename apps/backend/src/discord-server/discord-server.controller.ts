import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Put,
	Delete,
} from '@nestjs/common';
import { DiscordServerService } from './discord-server.service';
import { CreateDiscordServerDto } from './dto/create-discord-server.dto';
import { UpdateDiscordServerDto } from './dto/update-discord-server.dto';
import { DiscordServerDto } from './dto/discord-server.dto';
import { DiscordServer } from './entities/discord-server-entity';

@Controller('discord-server')
export class DiscordServerController {
	constructor(private readonly discordServerService: DiscordServerService) {}

	@Post()
	async create(
		@Body() data: CreateDiscordServerDto,
	): Promise<DiscordServerDto> {
		const server = await this.discordServerService.create(data);
		return new DiscordServerDto(server);
	}

	@Get()
	async findAll(): Promise<DiscordServerDto[]> {
		const servers = await this.discordServerService.findAll();
		return servers.map((s) => new DiscordServerDto(s));
	}

	@Get(':guildId')
	async findOne(
		@Param('guildId') guildId: string,
	): Promise<DiscordServerDto> {
		const server = await this.discordServerService.findOne(guildId);
		return new DiscordServerDto(server);
	}

	@Put(':guildId')
	async update(
		@Param('guildId') guildId: string,
		@Body() data: UpdateDiscordServerDto,
	): Promise<any> {
		return this.discordServerService.update(guildId, data);
	}

	@Delete(':guildId')
	async remove(@Param('guildId') guildId: string): Promise<any> {
		return this.discordServerService.remove(guildId);
	}

	// Endpoint pour récupérer la config Discord d'une communauté
	@Get('/by-community/:communityId')
	async findByCommunity(
		@Param('communityId') communityId: string,
	): Promise<DiscordServer> {
		return this.discordServerService.findOneByCommunity(
			Number(communityId),
		);
	}
}
