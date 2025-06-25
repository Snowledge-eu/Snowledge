import { Controller, Post, Body } from '@nestjs/common';
import { XrplProvider } from './xrpl.provider';
import { Public } from 'src/auth/auth.decorator';
import { GenerateAccountAndMintDto } from './dto/generate-account-and-mint.dto';

@Controller('xrpl')
export class XrplController {
	constructor(private readonly xrplProvider: XrplProvider) {}

	@Public()
	@Post('generate-account-and-mint-nft')
	generateAccountAndMintNft(
		@Body() generateAccountAndMintDto: GenerateAccountAndMintDto,
	) {
		return this.xrplProvider.generateAccountAndMintNft(
			generateAccountAndMintDto.email,
		);
	}
}
