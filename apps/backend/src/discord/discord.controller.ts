import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Query,
	Res,
	Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscordProvider } from './discord.provider';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { User } from 'src/user/decorator';
import { Response } from 'express';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
@ApiTags('auth')
@Controller('discord')
export class DiscordController {
	private readonly logger = new Logger(DiscordController.name);
	constructor(
		private discordProvider: DiscordProvider,
		private discordHarvestJobService: DiscordHarvestJobService,
	) {}

	@HttpCode(HttpStatus.OK)
	@Get('link')
	async getVerifyToken(
		@Res() res: Response,
		@User() user: UserEntity,
		@Query('code') code: string,
		@Query('state') state?: string,
	) {
		const { communityId } = JSON.parse(state);
		if (code) {
			const response = await this.discordProvider.linkDiscord(
				code,
				user,
				communityId,
			);
			if (response) {
				res.redirect(
					`${process.env.NEXT_PUBLIC_FRONTEND_URL}/${response.slug}?verify=discord`,
				);
			} else {
				res.redirect(
					`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile?verify=discord`,
				);
			}
		} else {
			res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/profile`);
		}
	}

	@Get('last-harvest/:guildId')
	async getLastHarvest(@Param('guildId') guildId: string) {
		console.log(guildId);
		console.log(parseInt(guildId));
		console.log(Number(guildId));
		const harvest =
			await this.discordHarvestJobService.findLastHarvestJobByDiscordServerId(
				guildId,
			);
		console.log(harvest);
		return harvest;
	}
}
