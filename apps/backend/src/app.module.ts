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
import { VoteModule } from './vote/vote.module';
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: ['.env.dev', '.env.prod'],
			isGlobal: true,
			load: [mailingConfig, postgresConfig, serverConfig],
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
			}),
		}),
		AuthModule,
		EmailModule,
		UserModule,
		SnowTestRegisterModule,
		DiscordModule,
		CommunityModule,
		LearnerModule,
		VoteModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
