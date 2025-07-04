import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import serverConfig from './config/server.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgresConfig from './config/postgres.config';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { SnowTestRegisterModule } from './snow-test-register/snow-test-register.module';
import { DiscordModule } from './discord/discord.module';
import mailingConfig from './config/mailing.config';
import { CommunityModule } from './community/community.module';
import { LearnerModule } from './learner/learner.module';
import { ProposalModule } from './proposal/proposal.module';
import { VoteModule } from './vote/vote.module';
import { DiscordBotModule } from './discord-bot/discord-bot.module';
import { DiscordServerModule } from './discord-server/discord-server.module';
import discordConfig from './config/discord.config';
import mongoConfig, { formatURIMongo } from './config/mongo.config';
import { MongooseModule } from '@nestjs/mongoose';
import { YoutubeModule } from './youtube/youtube.module';
import { AnalysisModule } from './analysis/analysis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { XrplModule } from './xrpl/xrpl.module';
import { SummaryModule } from './course-material/summary/summary.module';
@Module({
	imports: [
		EventEmitterModule.forRoot(),
		ConfigModule.forRoot({
			envFilePath: ['.env.dev', '.env.prod'],
			isGlobal: true,
			load: [
				discordConfig,
				mailingConfig,
				mongoConfig,
				postgresConfig,
				serverConfig,
			],
		}),
		MongooseModule.forRootAsync({
			imports: [ConfigModule],
			inject: [mongoConfig.KEY],
			useFactory: (mongoConfig) => ({
				uri: formatURIMongo(mongoConfig),
			}),
		}),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [postgresConfig.KEY],
			useFactory: (postgresConfig) => ({
				type: 'postgres',
				host: postgresConfig.host,
				port: postgresConfig.port,
				username: postgresConfig.username,
				password: postgresConfig.password,
				database: postgresConfig.database,
				synchronize: true,
				autoLoadEntities: true,
				ssl: postgresConfig.ssl,
			}),
		}),
		AuthModule,
		EmailModule,
		UserModule,
		SnowTestRegisterModule,
		DiscordModule,
		CommunityModule,
		LearnerModule,
		ProposalModule,
		VoteModule,
		DiscordBotModule,
		DiscordServerModule,
		YoutubeModule,
		AnalysisModule,
		XrplModule,
		SummaryModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
