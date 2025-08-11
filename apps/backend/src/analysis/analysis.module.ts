import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import {
	AnalysisResult,
	AnalysisResultSchema,
} from './schemas/analysis-result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscordModule } from 'src/discord/discord.module';
import { PromptModule } from 'src/prompt/prompt.module';
import { CommunityModule } from 'src/community/community.module';
import { UserModule } from 'src/user/user.module';
import { AnalysisHelper } from './analysis.helper';
import { PayloadBuilder } from './llm/payload-builder';
import { OvhClient } from './llm/call-ovh-api';
import { AnalysisProvider } from './analysis.provider';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AnalysisResult.name, schema: AnalysisResultSchema },
		]),
		DiscordModule,
		PromptModule,
		CommunityModule,
		UserModule,
	],
	controllers: [AnalysisController],
	providers: [
		AnalysisHelper,
		AnalysisService,
		PayloadBuilder,
		OvhClient,
		AnalysisProvider,
	],
	exports: [AnalysisService, AnalysisHelper, AnalysisProvider],
})
export class AnalysisModule {}
