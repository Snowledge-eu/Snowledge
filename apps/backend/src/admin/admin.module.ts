import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.provider';
import { CommunityModule } from '../community/community.module';
import { DiscordModule } from '../discord/discord.module';
import { UserModule } from '../user/user.module';
import { AnalysisModule } from '../analysis/analysis.module';
import { PromptModule } from '../prompt/prompt.module';

@Module({
	imports: [
		CommunityModule,
		DiscordModule,
		UserModule,
		AnalysisModule,
		PromptModule,
	],
	controllers: [AdminController],
	providers: [AdminProvider],
	exports: [AdminProvider],
})
export class AdminModule {}
