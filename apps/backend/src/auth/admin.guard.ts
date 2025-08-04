import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const user = request.user as User;

		if (!user) {
			throw new UnauthorizedException('User not authenticated');
		}

		if (!user.isAdmin) {
			throw new UnauthorizedException('Admin privileges required');
		}

		return true;
	}
}
