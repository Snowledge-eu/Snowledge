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
	UsePipes,
	UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DiscordProvider } from './discord.provider';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { User } from 'src/user/decorator';
import { Response } from 'express';
import { DiscordHarvestJobService } from './services/discord-harvest-job.service';
import { DiscordHarvestJob } from './schemas/discord-harvest-job.schema';
import { DiscordMessageService } from './services/discord-message.service';
import { DiscordChannelService } from './services/discord-channel.service';
import { TransformLongToStringInterceptor } from 'src/shared/interceptors/transform-long-to-string.pipe';
@ApiTags('auth')
@Controller('discord')
export class DiscordController {
	// private readonly logger = new Logger(DiscordController.name);
	constructor(
		private discordProvider: DiscordProvider,
		private discordChannelService: DiscordChannelService,
		private discordHarvestJobService: DiscordHarvestJobService,
		private discordMessageService: DiscordMessageService,
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
	async getLastHarvest(@Param('guildId') guildId: string): Promise<
		DiscordHarvestJob & {
			lastFetched: {
				date: Date;
				channels: Array<{ name: string; qty: number }>;
			};
		}
	> {
		const last =
			await this.discordHarvestJobService.findLastHarvestJobByDiscordServerId(
				guildId,
			);

		if (!last) {
			return null;
		}

		const arrInfo: Array<{ name: string; qty: number }> = [];
		for (const channel of last.channels) {
			const channelInfo = await this.discordChannelService.findOne(
				channel.toString(),
			);
			const countMess =
				await this.discordMessageService.countMessageForDate(
					channel,
					last.created_at,
				);
			arrInfo.push({
				name: channelInfo.name,
				qty: countMess,
			});
		}
		const lastFetched = {
			date: last.created_at,
			channels: arrInfo,
		};

		return { ...last, lastFetched };
	}

	@Post('count-message')
	async countMessageInterval(
		@Body()
		info: {
			channelId: string[];
			interval: 'last_day' | 'last_week' | 'last_month';
		},
	): Promise<number> {
		const now = new Date();
		let startDate: Date;
		let count = 0;

		switch (info.interval) {
			case 'last_day':
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 1);
				break;
			case 'last_week':
				startDate = new Date(now);
				startDate.setDate(now.getDate() - 7);
				break;
			case 'last_month':
				startDate = new Date(now);
				startDate.setMonth(now.getMonth() - 1);
				break;
			default:
				throw new Error(`Invalid interval: ${info.interval}`);
		}

		for (const id of info.channelId) {
			const tmpcount =
				await this.discordMessageService.countMessageForPeriod(
					id,
					startDate,
				);
			count += tmpcount;
		}
		return count;
	}
}
