import { Injectable } from '@nestjs/common';
import { XrplService } from './xrpl.service';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class XrplProvider {
	constructor(private readonly xrplService: XrplService) {}

	async generateAccountAndMintNft(user: User) {
		return this.xrplService.generateAccountAndMintNft(user);
	}
}
