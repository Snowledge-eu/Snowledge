import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateDiscordServerDto {
	@IsString()
	@IsOptional()
	guildId?: string;

	@IsString()
	guildName?: string;

	@IsString()
	@IsOptional()
	proposeChannelId?: string;

	@IsString()
	@IsOptional()
	voteChannelId?: string;

	@IsString()
	@IsOptional()
	resultChannelId?: string;

	@IsNumber()
	@IsOptional()
	communityId?: number;

	@IsString()
	@IsOptional()
	authRoleId?: string;

	@IsString()
	@IsOptional()
	authChannelId?: string;
}
