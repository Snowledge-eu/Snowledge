import {
	Controller,
	Post,
	Body,
	NotFoundException,
	Get,
	Param,
} from '@nestjs/common';
import { XrplProvider } from './xrpl.provider';
import { Public } from 'src/auth/auth.decorator';
import { GenerateAccountAndMintDto } from './dto/generate-account-and-mint.dto';
import { UserService } from 'src/user/user.service';

@Controller('xrpl')
export class XrplController {
	constructor(
		private readonly xrplProvider: XrplProvider,
		private readonly userService: UserService,
	) {}

	@Public()
	@Post('generate-account-and-mint-nft')
	async generateAccountAndMintNft(
		@Body() generateAccountAndMintDto: GenerateAccountAndMintDto,
	) {
		const user = await this.userService.findOneByEmail(
			generateAccountAndMintDto.email,
		);
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return this.xrplProvider.generateAccountAndMintNft(user);
	}

	// ROUTE UNIQUEMENT EN DEV
	// @Public()
	// @Get('wallet-info/:encryptedSeed')
	// async getWalletInfo(@Param('encryptedSeed') encryptedSeed: string) {
	// 	return this.xrplProvider.getWalletInfo(encryptedSeed);
	// }
}
