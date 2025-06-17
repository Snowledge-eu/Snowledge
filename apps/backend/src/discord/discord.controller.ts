import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Query,
	Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscordProvider } from './discord.provider';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { User } from 'src/user/decorator';
import { Response } from 'express';
@ApiTags('auth')
@Controller('discord')
export class DiscordController {
	private readonly logger = new Logger(DiscordController.name);
	constructor(private discordProvider: DiscordProvider) {}

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
					`http://localhost:3000/${response.slug}?verify=discord`,
				);
			} else {
				res.redirect(`http://localhost:3000/profile?verify=discord`);
			}
		} else {
			res.redirect('http://localhost:3000/profile');
		}
	}
}
