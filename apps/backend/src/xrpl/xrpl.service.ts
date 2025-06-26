import { Injectable } from '@nestjs/common';
import { XrplHelper } from './xrpl.helper';
import { Wallet, convertStringToHex } from 'xrpl';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class XrplService {
	constructor(private readonly xrplHelper: XrplHelper) {}

	async generateAccountAndMintNft(user: User) {
		await this.xrplHelper.connect();
		const client = this.xrplHelper.getClient();

		const newWallet = Wallet.generate();

		await client.fundWallet(newWallet);

		const metadataUrl = `${process.env.BACK_URL}/user/${user.id}/nft-metadata`;

		const transaction = await client.autofill({
			TransactionType: 'NFTokenMint',
			Account: newWallet.classicAddress,
			NFTokenTaxon: 0,
			Flags: 1, // tfBurnable (implies non-transferable by default)
			URI: convertStringToHex(metadataUrl),
		});

		const signed = newWallet.sign(transaction);

		const result = await client.submitAndWait(signed.tx_blob);

		await this.xrplHelper.disconnect();

		const nftId =
			result.result.meta['nftoken_id'] || result.result.meta['NFTokenID'];

		return {
			account: newWallet.classicAddress,
			seed: newWallet.seed,
			nftResult: result,
			metadataUrl,
			nftId,
		};
	}
}
