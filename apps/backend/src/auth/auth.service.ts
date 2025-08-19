import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IAuthPayload } from '../shared/interface/IAuthPayload';

@Injectable()
export class AuthService {
	constructor(private readonly jwtService: JwtService) {}

	createAccessToken(payload: IAuthPayload) {
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_ACCESS_SECRET,
			expiresIn: '30m',
		});
	}
	async createRefreshToken(payload: IAuthPayload) {
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_REFRESH_SECRET,
			expiresIn: '7d',
		});
	}
	createEmailVerificationToken(payload: { userId: number; email: string }) {
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_EMAIL_SECRET,
			expiresIn: '1h', // ou 24h selon ton besoin
		});
	}
	createForgotPasswordToken(payload: { userId: number; email: string }) {
		return this.jwtService.sign(payload, {
			secret: process.env.JWT_EMAIL_SECRET,
			expiresIn: '1h', // ou 24h selon ton besoin
		});
	}
	async validateUser(payload: any): Promise<any> {
		// Validate the user exists in your database, etc.
		return { id: payload.id };
	}

	// Méthodes de validation améliorées
	async validateAccessToken(token: string): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_ACCESS_SECRET,
			});
		} catch (error) {
			throw new Error('Invalid access token');
		}
	}

	async validateRefreshToken(token: string): Promise<any> {
		try {
			return await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_REFRESH_SECRET,
			});
		} catch (error) {
			throw new Error('Invalid refresh token');
		}
	}

	isTokenExpired(token: string): boolean {
		try {
			const decoded = this.jwtService.decode(token) as any;
			if (!decoded || !decoded.exp) return true;
			
			const currentTime = Math.floor(Date.now() / 1000);
			return decoded.exp < currentTime;
		} catch {
			return true;
		}
	}
}
