import { Module } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisController } from './analysis.controller';
import {
	AnalysisResult,
	AnalysisResultSchema,
} from './schemas/analysis-result.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscordModule } from 'src/discord/discord.module';
import { AnalysisHelper } from './analysis.helper';
import { PayloadBuilder } from './llm/payload-builder';
import { OvhClient } from './llm/call-ovh-api';
import { AnalysisProvider } from './analysis.provider';
import { PromptManagerService } from './llm/prompt-manager.service';
import { PromptSharedModule } from '../prompt/prompt-shared.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AnalysisResult.name, schema: AnalysisResultSchema },
		]),
		DiscordModule,
		PromptSharedModule,
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
