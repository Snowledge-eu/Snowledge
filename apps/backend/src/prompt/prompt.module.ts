import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptController } from './prompt.controller';
import { PromptProvider } from './prompt.provider';
import { PromptService } from './prompt.service';

import { Prompt } from './entities/prompt.entity';
import { DiscordModule } from '../discord/discord.module';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { AdminGuard } from '../auth/admin.guard';


@Module({
	imports: [
		TypeOrmModule.forFeature([Prompt]),
		DiscordModule,
		CommunityModule,
		UserModule,
	],
	controllers: [PromptController],
	providers: [PromptProvider, PromptService, AdminGuard],
	exports: [PromptService, PromptProvider],
})
export class PromptModule {}
