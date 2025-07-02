import { Injectable } from '@nestjs/common';
import { XrplHelper } from './xrpl.helper';
import { Wallet, convertStringToHex } from 'xrpl';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class XrplService {
	constructor(
		private readonly xrplHelper: XrplHelper,
		private readonly userService: UserService,
	) {}

	/**
	 * Génère un wallet XRPL, mint un NFT, chiffre la seed et la stocke en base pour l'utilisateur.
	 * @param user L'utilisateur concerné
	 */
	async generateAccountAndMintNft(user: User) {
		try {
			await this.xrplHelper.connect();
			const client = this.xrplHelper.getClient();

			// Génération d'un nouveau wallet XRPL
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
				result.result.meta['nftoken_id'] ||
				result.result.meta['NFTokenID'];

			// Chiffrement de la seed XRPL avant stockage
			const encryptedSeed = this.xrplHelper.encryptSeed(newWallet.seed);
			const updateData: any = { seed: encryptedSeed };
			if (nftId) {
				updateData.nftId = nftId;
			}
			await this.userService.update(user.id, updateData);

			return {
				account: newWallet.classicAddress,
				seed: 'ENCRYPTED', // Jamais retourner la seed en clair !
				nftResult: result,
				metadataUrl,
				nftId,
			};
		} catch (error) {
			console.error('Erreur lors du mint NFT XRPL :', error);
			throw new Error(
				'Erreur lors de la génération du wallet ou du mint NFT XRPL',
			);
		}
	}

	/**
	 * Déchiffre la seed XRPL d'un utilisateur.
	 * @param user L'utilisateur concerné
	 * @returns La seed XRPL en clair
	 */
	decryptUserSeed(user: User): string | null {
		if (!user.seed) return null;
		return this.xrplHelper.decryptSeed(user.seed);
	}
}
