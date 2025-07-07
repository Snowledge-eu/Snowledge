import { IsString, IsOptional, IsArray, IsISO8601 } from 'class-validator';

export class DiscordHarvestDto {
  @IsString()
  discordId: string;

  @IsString()
  serverId: string;

  @IsArray()
  channels: string[];

  @IsOptional()
  @IsISO8601()
  after?: string;

  @IsOptional()
  @IsISO8601()
  before?: string;
}
