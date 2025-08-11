import {
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { SignUpDto } from '../auth/dto/sign-up.dto';
import { EmailService } from '../email/email.service';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { EmailHelper } from 'src/email/email.helper';
import { XrplProvider } from 'src/xrpl/xrpl.provider';
import { DiscordLinkProvider } from 'src/discord-bot/providers/discord-link.provider';
// import { hexToBytes } from 'viem/utils';

@Injectable()
export class AuthProvider {
	private readonly logger = new Logger(AuthProvider.name);

	constructor(
		private readonly authService: AuthService,
		private readonly emailService: EmailService,
		private readonly emailHelper: EmailHelper,
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
		private readonly xrplProvider: XrplProvider,
		private readonly discordLinkProvider: DiscordLinkProvider,
	) {}

	async signUp(signUpDto: SignUpDto): Promise<{
		access_token: string;
		refresh_token: string;
		auth: string;
		nftId: string;
	}> {
		try {
			const {
				gender,
				firstname,
				lastname,
				pseudo,
				age,
				email,
				password,
			} = signUpDto;
			const hashPassword = await bcrypt.hash(password, 10);

			const user = await this.userService.create({
				gender,
				firstname,
				lastname,
				pseudo,
				email,
				age,
				password: hashPassword,
			});

			const nftResult =
				await this.xrplProvider.generateAccountAndMintNft(user);

			const { access_token, refresh_token } =
				await this.generateTokensForUser(user);

			const verifyToken =
				await this.authService.createEmailVerificationToken({
					userId: user.id,
					email: user.email,
				});

			await this.emailHelper.tokenEmail(user.email, verifyToken);

			return {
				access_token,
				refresh_token,
				auth: 'create',
				nftId: nftResult.nftId,
			};
		} catch (error: any) {
			this.logger.error(error);
			throw new Error(`Error creating userr: ${error.message}`);
		}
	}
	async signIn(
		email: string,
		pass: string,
	): Promise<{ access_token: string; refresh_token: string; auth: string }> {
		const user = await this.userService.findOneByEmail(email);
		// console.log(user);
		if (!user) {
			throw new UnauthorizedException('Invalid user information');
		}
		const passwordMatch = await bcrypt.compare(pass, user.password);
		if (!passwordMatch) {
			throw new UnauthorizedException('Invalid information user');
		}

		const { access_token, refresh_token } =
			await this.generateTokensForUser(user);
		return {
			access_token,
			refresh_token,
			auth: 'log',
		};
	}

	async signOut(refreshToken: string) {
		try {
			const payload = await this.jwtService.verify(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET,
			});

			const user = await this.userService.findOneById(payload.userId);

			if (user) {
				await this.userService.update(user.id, { refreshToken: null });
			}

			return { success: true };
		} catch (e) {
			return { success: true };
		}
	}
	async refreshToken(
		refreshToken: string,
	): Promise<{ access_token: string }> {
		try {
			const payload = this.jwtService.verify(refreshToken, {
				secret: process.env.JWT_REFRESH_SECRET,
			});

			const user = await this.userService.findOneById(payload.userId);
			const isValid = await bcrypt.compare(
				refreshToken,
				user.refreshToken,
			);

			if (!user || !isValid) {
				throw new UnauthorizedException('Invalid refresh token');
			}

			const newAccessToken = this.jwtService.sign(
				{ sub: user.id, email: user.email },
				{ expiresIn: '30m' },
			);

			return { access_token: newAccessToken };
		} catch (error) {
			this.logger.error(error);
		}
	}
	async verifyTokenEmail(token: string) {
		// TODO réécrire pour passer par le providerEmail plutot que directement appelé le helper
		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_EMAIL_SECRET,
			});

			const user = await this.userService.findOneById(payload.userId);
			if (!user) throw new NotFoundException('User not found');

			// 💡 Marque le compte comme vérifié
			await this.userService.update(user.id, { isActive: true });

			return { success: true };
		} catch (e) {
			throw new UnauthorizedException('Invalid or expired token');
		}
	}
	async checkEmail(email: string) {
		const user = await this.userService.findOneByEmail(email);
		if (!user) throw new Error('User not found');

		const emailFind = await this.emailService.findByEmail(email);
		if (!emailFind) return true;

		const now = new Date();
		const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000); // Soustrait 15 minutes au temps actuel

		if (emailFind.used && emailFind.updated_at >= fifteenMinutesAgo) {
			return true;
		} else {
			return emailFind;
		}
	}
	async changePassword(password: string, user: User){
		const hashPassword = await bcrypt.hash(password, 10);

		return this.userService.updatePassword(user.id, hashPassword)

	}
	async forgotPassword(email: string) {
		const userFind = await this.userService.findOneByEmail(email);
		if (!userFind) return false;

		const token = await this.authService.createForgotPasswordToken({
			userId: userFind.id,
			email: userFind.email,
		});

		await this.emailHelper.forgotPassword(userFind.email, token);
	}
	async verifyTokenChangePassword(token: string) {
		const payload = await this.jwtService.verifyAsync(token, {
			secret: process.env.JWT_EMAIL_SECRET,
		});

		const user = await this.userService.findOneById(payload.userId);
		if (!user){
			return false;
		} else {
			return user;
		}
	} 
	private async generateTokensForUser(user: User) {
		const payload = {
			userId: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
		};
		const accessToken = await this.authService.createAccessToken(payload);
		const refreshToken = await this.authService.createRefreshToken(payload);
		await this.userService.update(user.id, {
			refreshToken: await bcrypt.hash(refreshToken, 10),
		});

		return { access_token: accessToken, refresh_token: refreshToken };
	}

	async signInWithDiscord(
		code: string,
		state?: string,
	): Promise<{ user: any; access_token: string; refresh_token: string }> {
		// Utilise le flow générique Discord sans notion de guild/community
		let user = await this.discordLinkProvider.handleDiscordAuth(code);
		if (!user)
			throw new UnauthorizedException('Discord authentication failed');
		// Mint NFT si nouvel utilisateur (pas de nftId)
		if (!user.nftId) {
			await this.xrplProvider.generateAccountAndMintNft(user);
			// On recharge l'utilisateur pour avoir le nftId à jour
			user = await this.userService.findOneById(user.id);
		}
		// Génère les tokens comme pour un login classique
		const payload = {
			userId: user.id,
			firstname: user.firstname,
			lastname: user.lastname,
		};
		const access_token = await this.authService.createAccessToken(payload);
		const refresh_token =
			await this.authService.createRefreshToken(payload);
		await this.userService.update(user.id, {
			refreshToken: await bcrypt.hash(refresh_token, 10),
		});
		return { user, access_token, refresh_token };
	}
}
