import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.provider';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { EmailModule } from '../email/email.module';
import { AuthService } from './auth.service';
import { XrplModule } from 'src/xrpl/xrpl.module';

@Module({
	imports: [
		EmailModule,
		UserModule,
		XrplModule,
		JwtModule.register({
			global: true,
			secret: jwtConstants.secret,
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
