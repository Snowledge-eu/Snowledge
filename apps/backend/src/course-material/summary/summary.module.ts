import { Module } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { SummaryController } from './summary.controller';
import { SummaryResult, SummaryResultSchema } from './schemas/summary.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalysisModule } from 'src/analysis/analysis.module';
import { AnalysisProvider } from 'src/analysis/analysis.provider';
import { DiscordModule } from 'src/discord/discord.module';
import { PromptSharedModule } from 'src/prompt/prompt-shared.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: SummaryResult.name, schema: SummaryResultSchema },
		]),
		AnalysisModule,
		DiscordModule,
		PromptSharedModule,
	],
	controllers: [SummaryController],
	providers: [SummaryService, AnalysisProvider],
	exports: [SummaryService, AnalysisProvider],
})
export class SummaryModule {}
