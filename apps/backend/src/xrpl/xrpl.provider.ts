import { Injectable } from '@nestjs/common';
import { XrplService } from './xrpl.service';

@Injectable()
export class XrplProvider {
	constructor(private readonly xrplService: XrplService) {}

	async generateAccountAndMintNft(email: string) {
		return this.xrplService.generateAccountAndMintNft(email);
	}
}
