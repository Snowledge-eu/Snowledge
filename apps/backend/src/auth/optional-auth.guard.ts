import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class OptionalAuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private userService: UserService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		// Si pas de token, on continue sans user
		if (!token) {
			request.user = null;
			return true;
		}

		try {
			// Vérifier le token
			const payload = await this.jwtService.verifyAsync(token, {
				secret: process.env.JWT_SECRET,
			});

			// Récupérer l'utilisateur
			const user = await this.userService.findOne(payload.sub);
			request.user = user;
		} catch (error) {
			// En cas d'erreur, on continue sans user
			request.user = null;
		}

		return true;
	}

	private extractTokenFromHeader(request: any): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
