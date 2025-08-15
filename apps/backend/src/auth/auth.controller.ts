import {
	Body,
	Controller,
	Post,
	HttpCode,
	HttpStatus,
	Get,
	Param,
	Logger,
	Req,
	UnauthorizedException,
	Res,
	Delete,
	Query,
	BadRequestException,
	Patch,
} from '@nestjs/common';
import { AuthProvider } from './auth.provider';
import { Public } from './auth.decorator';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { SignInDto, SignUpDto, VerifyCodeDto } from './dto';
import { EmailProvider } from 'src/email/email.provider';
import { Response, Request } from 'express';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ForgotPassword } from './dto/forgot-password.dto';
import { ChangePassword } from './dto/change-password.dto';
import { User } from 'src/user/decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name);
	constructor(
		private authProvider: AuthProvider,
		private readonly emailProvider: EmailProvider,
	) {}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Get('check')
	check(@Req() req: Request) {
		const accessToken = req.cookies?.['access-token'];
		if (!accessToken) {
			throw new UnauthorizedException('No access token');
		}
		return { access_token: accessToken };
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('sign-in')
	@ApiBody({ type: SignInDto })
	async signIn(
		@Body() signInDto: SignInDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { access_token, refresh_token, auth } =
			await this.authProvider.signIn(signInDto.email, signInDto.password);

		res.cookie('refresh-token', refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		res.cookie('access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 15 * 60 * 1000, // 15 minutes
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
		return { access_token, auth };
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('sign-up')
	@ApiBody({ type: SignUpDto })
	async signUp(
		@Body() signUpDto: SignUpDto,
		@Res({ passthrough: true }) res: Response,
	) {
		// return this.authProvider.signUp(signUpDto);
		const { access_token, refresh_token, auth, nftId } =
			await this.authProvider.signUp(signUpDto);
		res.cookie('refresh-token', refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		res.cookie('access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 30 * 60 * 1000, // 15 minutes
			domain: process.env.COOKIE_DOMAIN || undefined,
		});

		return { access_token, auth, nftId };
	}

	@Public()
	@HttpCode(HttpStatus.NO_CONTENT)
	@Delete('session')
	async signOut(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	) {
		const refreshToken = req.cookies?.['refresh-token'];
		const accessToken = req.cookies?.['access-token'];
		console.log('refreshToken', refreshToken);
		if (!refreshToken && !accessToken) {
			return { success: true };
		}

		await this.authProvider.signOut(refreshToken);
		// Delete the client-side cookie
		res.clearCookie('refresh-token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
		res.clearCookie('access-token', {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('refresh-token')
	refreshToken(
		@Req() req: Request,
		@Body('refreshToken') refreshToken: string,
	) {
		if (req.headers['x-internal-call'] !== 'true') {
			throw new UnauthorizedException('Blocked');
		}

		if (!refreshToken && !req.cookies?.['refresh-token']) {
			throw new UnauthorizedException('No refresh token provided');
		}
		const token = refreshToken ?? req.cookies?.['refresh-token'];
		return this.authProvider.refreshToken(token);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('verify-code')
	postVerifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
		return this.emailProvider.findCode(
			verifyCodeDto.code,
			verifyCodeDto.email,
		);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('verify-token')
	postVerifyToken(@Body() verifyTokenDto: VerifyTokenDto) {
		return this.authProvider.verifyTokenEmail(verifyTokenDto.token);
	}

	@Public()
	@Get('discord/callback')
	async discordCallback(
		@Query('code') code: string,
		@Res() res: Response,
		@Query('state') state?: string,
	) {
		if (!code) {
			return res.redirect(
				`${process.env.FRONT_URL}/sign-in?error=missing_code`,
			);
		}
		// Utilise la logique du DiscordLinkProvider pour créer ou connecter l'utilisateur
		const { user, access_token, refresh_token } =
			await this.authProvider.signInWithDiscord(code, state);
		if (!user) {
			return res.redirect(
				`${process.env.FRONT_URL}/sign-in?error=discord_auth_failed`,
			);
		}
		res.cookie('refresh-token', refresh_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 * 1000,
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
		res.cookie('access-token', access_token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 15 * 60 * 1000,
			domain: process.env.COOKIE_DOMAIN || undefined,
		});
		return res.redirect(`${process.env.FRONT_URL}/`);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('forgot-password')
	forgotPassword(@Body() forgotPassword: ForgotPassword) {
		return this.authProvider.forgotPassword(forgotPassword.email);
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('change-password')
	async changePassword(@Body() body: ChangePassword) {
		if (body.token) {
			const authorizedUser =
				await this.authProvider.verifyTokenChangePassword(body.token);
			if (!authorizedUser) {
				throw new BadRequestException('Token invalid');
			}
			if (!body.password) {
				throw new BadRequestException('Missing new password');
			}
			return this.authProvider.changePassword(
				body.password,
				authorizedUser,
			);
		}
	}

	@HttpCode(HttpStatus.OK)
	@Patch('change-password')
	async changePasswordConnected(
		@Body() body: ChangePassword,
		@User() user: UserEntity,
	) {
		if (!user) {
			throw new BadRequestException('User undefined');
		}
		const { currentPassword, newPassword, confirmPassword } =
			body || ({} as any);
		if (!currentPassword || !newPassword || !confirmPassword) {
			throw new BadRequestException('Missing password fields');
		}
		if (newPassword !== confirmPassword) {
			throw new BadRequestException('Passwords do not match');
		}
		// Validate current password
		const isValid = await this.authProvider.validateCurrentPassword(
			user.id,
			currentPassword,
		);
		if (!isValid) {
			throw new BadRequestException('Current password incorrect');
		}
		return this.authProvider.changePassword(newPassword, user);
	}
}
