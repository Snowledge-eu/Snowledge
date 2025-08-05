import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminProvider } from './admin.provider';
import { AuthGuard } from '../auth/auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
	constructor(private readonly adminProvider: AdminProvider) {}

	@Get('prompts')
	async getPrompts() {
		return this.adminProvider.getPrompts();
	}

	@Get('communities')
	async getCommunities() {
		return this.adminProvider.getCommunities();
	}

	@Get('analysis-history')
	async getAnalysisHistory(
		@Query('platform') platform?: string,
		@Query('prompt_key') prompt_key?: string,
		@Query('community') community?: string,
		@Query('date_from') date_from?: string,
		@Query('date_to') date_to?: string,
		@Query('sort_order') sort_order?: string,
	) {
		return this.adminProvider.getAnalysisHistory({
			platform,
			prompt_key,
			community,
			date_from,
			date_to,
			sort_order,
		});
	}
}
