import {
	Controller,
	Post,
	Param,
	Body,
	Get,
	Req,
	UseGuards,
	Query,
} from '@nestjs/common';
import { ResourceProvider } from './resource.provider';
import { BuyResourceDto } from './dto/buy-resource.dto';
import { User } from '../user/decorator';
import { User as UserEntity } from '../user/entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { XrplService } from '../xrpl/xrpl.service';
import { Public } from '../auth/auth.decorator';

@Controller('resources')
export class ResourceController {
	constructor(
		private readonly resourceProvider: ResourceProvider,
		private readonly xrplService: XrplService,
	) {}

	@Post(':id/buy')
	async buyResource(
		@Param('id') resourceId: string,
		@Query('community') communityId: string,
		@Body() buyResourceDto: BuyResourceDto,
		@User() user: UserEntity,
	) {
		console.log('communityId', communityId);
		return this.resourceProvider.buyResource(
			resourceId,
			user,
			buyResourceDto,
			communityId,
		);
	}

	@Get(':id/balances')
	async getResourceBalances(
		@Param('id') resourceId: string,
		@User() user: UserEntity,
	) {
		return this.resourceProvider.getResourceBalances(resourceId, user);
	}

	@UseGuards(AuthGuard)
	@Get(':id/has-nft')
	async hasNft(@Param('id') resourceId: string, @Req() req: any) {
		const user = req.user;
		const hasNft = await this.xrplService.hasNftForResource(
			user,
			resourceId,
		);
		return { hasNft };
	}

	@Public()
	@Get(':id/nft-metadata')
	async getResourceNftMetadata(@Param('id') resourceId: string) {
		const baseUrl = process.env.BACK_URL || 'http://localhost:4000';
		const resource =
			await this.resourceProvider.getResourceById(resourceId);
		if (!resource) {
			return {
				name: 'Snowledge Resource',
				description: 'Resource not found',
				image: `${baseUrl}/default-resource.png`,
				attributes: [],
			};
		}
		// Mapping format → image (fichiers statiques dans /public)
		const formatImages: Record<string, string> = {
			Masterclass: `${baseUrl}/masterclass.png`,
			Workshop: `${baseUrl}/workshop.png`,
			Whitepaper: `${baseUrl}/whitepaper.png`,
			Webinar: `${baseUrl}/webinar.png`,
		};
		const image =
			formatImages[resource.format] || `${baseUrl}/default-resource.png`;
		return {
			name: `Snowledge Resource: ${resource.title}`,
			description: resource.description,
			image,
			attributes: [
				{ trait_type: 'Resource ID', value: resource.id },
				{ trait_type: 'Format', value: resource.format },
				{ trait_type: 'Date', value: resource.date },
				{
					trait_type: 'CreatorId',
					value: resource.creator?.userId || '',
				},
				{ trait_type: 'Price (EUR)', value: resource.price },
				{
					trait_type: 'ContributorIds',
					value: resource.contributors.map((c: any) => c.userId),
				},
			],
		};
	}
}
