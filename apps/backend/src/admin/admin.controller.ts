import {
	Controller,
	Get,
	UseGuards,
	Request,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { User } from '../user/entities/user.entity';
import { Param } from '@nestjs/common';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
	constructor(private readonly adminProvider: AdminProvider) {}

	@Get('communities')
	async getAllCommunities(@Request() req: any) {
		const user = req.user as User;
		return this.adminProvider.getAllCommunities(user);
	}

	@Get('communities/:id/messages')
	async getCommunityMessages(@Request() req: any, @Param('id') id: string) {
		const user = req.user as User;
		return this.adminProvider.getCommunityMessages(+id, user);
	}

	@Get('stats')
	async getAdminStats(@Request() req: any) {
		const user = req.user as User;
		return this.adminProvider.getAdminStats(user);
	}
}
