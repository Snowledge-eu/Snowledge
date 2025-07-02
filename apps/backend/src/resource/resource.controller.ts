import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { ResourceProvider } from './resource.provider';
import { BuyResourceDto } from './dto/buy-resource.dto';
import { User } from '../user/decorator';
import { User as UserEntity } from '../user/entities/user.entity';

@Controller('resources')
export class ResourceController {
	constructor(private readonly resourceProvider: ResourceProvider) {}

	@Post(':id/buy')
	async buyResource(
		@Param('id') resourceId: string,
		@Body() buyResourceDto: BuyResourceDto,
		@User() user: UserEntity,
	) {
		return this.resourceProvider.buyResource(
			resourceId,
			user,
			buyResourceDto,
		);
	}

	@Get(':id/balances')
	async getResourceBalances(
		@Param('id') resourceId: string,
		@User() user: UserEntity,
	) {
		return this.resourceProvider.getResourceBalances(resourceId, user);
	}
}
