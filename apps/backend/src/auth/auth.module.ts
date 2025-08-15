import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';
import { XrplModule } from 'src/xrpl/xrpl.module';
import { DiscordBotModule } from 'src/discord-bot/discord-bot.module';

@Module({
	imports: [
		EmailModule,
		UserModule,
		XrplModule,
		DiscordBotModule,
		JwtModule.register({
			global: true,
			secret: process.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: '1d' },
		}),
	],
	controllers: [AuthController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		AuthProvider,
		AuthService,
	],
})
export class AuthModule {}
