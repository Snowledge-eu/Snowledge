import { IsEnum, IsInt, IsString } from 'class-validator';

export enum AnalyzePeriod {
	LAST_DAY = 'last_day',
	LAST_WEEK = 'last_week',
	LAST_MONTH = 'last_month',
}

export class DiscordAnalyzeDto {
	@IsInt()
	creator_id: number;

	@IsInt()
	serverId: number;

	@IsString()
	channelId: string;

	@IsString()
	prompt_key: string;

	@IsEnum(AnalyzePeriod)
	period: AnalyzePeriod;
}
