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
import { JwtModule } from '@nestjs/jwt';
import { AnalysisHelper } from './analysis.helper';
import { PayloadBuilder } from './llm/payload-builder';
import { OvhClient } from './llm/call-ovh-api';
import { AnalysisProvider } from './analysis.provider';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: AnalysisResult.name, schema: AnalysisResultSchema },
		]),
		DiscordModule,
		PromptModule,
		CommunityModule,
		UserModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: { expiresIn: '24h' },
		}),
	],
	controllers: [AnalysisController],
	providers: [
		AnalysisHelper,
		AnalysisService,
		PayloadBuilder,
		OvhClient,
		AnalysisProvider,
		OptionalAuthGuard,
	],
	exports: [AnalysisService, AnalysisHelper, AnalysisProvider],
})
export class AnalysisModule {}
