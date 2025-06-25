import { Injectable } from '@nestjs/common';
import { XrplHelper } from './xrpl.helper';
import { Wallet, convertStringToHex } from 'xrpl';

@Injectable()
export class XrplService {
	constructor(private readonly xrplHelper: XrplHelper) {}

	async generateAccountAndMintNft(email: string) {
		await this.xrplHelper.connect();
		const client = this.xrplHelper.getClient();

		// Generate a new wallet
		const newWallet = Wallet.generate();

		console.log('newWallet', newWallet);

		// Fund the new wallet from the faucet
		await client.fundWallet(newWallet);

		// Prepare the NFT minting transaction
		const transaction = await client.autofill({
			TransactionType: 'NFTokenMint',
			Account: newWallet.classicAddress,
			NFTokenTaxon: 0,
			Flags: 8, // tfTransferable
			URI: convertStringToHex(email),
		});

		// Sign and submit the transaction
		const signed = newWallet.sign(transaction);
		const result = await client.submitAndWait(signed.tx_blob);

		await this.xrplHelper.disconnect();

		console.log('result', result);

		return {
			account: newWallet.classicAddress,
			seed: newWallet.seed,
			nftResult: result,
		};
	}
}
