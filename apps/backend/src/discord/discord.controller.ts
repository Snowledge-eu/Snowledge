import {
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Query,
	Res,
	Param,
	Post,
	Body,
	UseInterceptors,
	Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscordProvider } from './discord.provider';
import { User as UserEntity } from '../user/entities/user.entity';
import { User } from '../user/decorator';
import { Response } from 'express';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
import { DiscordHarvestJob } from './schemas/discord-harvest-job.schema';
import { DiscordMessageService } from './services/discord-message.service';
import { DiscordChannelService } from './services/discord-channel.service';
import { TransformLongToStringInterceptor } from '../shared/interceptors/transform-long-to-string.pipe';
import { DiscordHarvestDto } from './dto/discord-harvest.dto';
@ApiTags('auth')
@Controller('discord')
export class DiscordController {
	private readonly logger = new Logger(DiscordController.name);
	constructor(
		private readonly discordProvider: DiscordProvider,
		private readonly discordChannelService: DiscordChannelService,
		private readonly discordHarvestJobService: DiscordHarvestJobService,
		private readonly discordMessageService: DiscordMessageService,
	) {}

	@HttpCode(HttpStatus.OK)
	@Get('link')
	async getVerifyToken(
		@Res() res: Response,
		@User() user: UserEntity,
		@Query('code') code: string,
		@Query('state') state?: string,
	) {
		const { communityId } = state ? JSON.parse(state) : {};
		if (code) {
			const response = await this.discordProvider.linkDiscord(
				code,
				user,
				communityId,
			);
			if (response) {
				res.redirect(
					`${process.env.FRONT_URL}/${response.slug}?verify=discord`,
				);
			} else {
				res.redirect(`${process.env.FRONT_URL}/profile?verify=discord`);
			}
		} else {
			res.redirect(`${process.env.FRONT_URL}/profile`);
		}
	}

	@Get('last-harvest/:guildId')
	@UseInterceptors(TransformLongToStringInterceptor)
	async getLastHarvest(@Param('guildId') guildId: string) {
		return this.discordProvider.getLastHarvest(guildId);
	}

	@Get('servers')
	async listDiscordServers() {
		return await this.discordProvider.listDiscordServers();
	}

	@Get('harvest/status/:jobId')
	async getHarvestJobStatus(@Param('jobId') jobId: string) {
		try {
			return await this.discordProvider.getHarvestJobStatus(jobId);
		} catch (e) {
			return { error: (e as Error).message };
		}
	}

	@Post('count-message')
	async countMessageInterval(
		@Body() info: { channelId: string[]; interval: 'last_day' | 'last_week' | 'last_month' },
	): Promise<number> {
		return this.discordProvider.countMessageInterval(info);
	}
	@Post('harvest')
	async harvestDiscord(@Body() dto: any) {
		return this.discordProvider.harvestDiscord(dto);
	}
	
	@Delete('disconnect')
	async disconnect(@User() user: UserEntity){
		return await this.discordProvider.disconnectDiscord(user);
	}
}
