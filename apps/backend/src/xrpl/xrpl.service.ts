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

	/**
	 * Récupère la balance XRPL d'un utilisateur (en XRP).
	 * @param user L'utilisateur concerné
	 * @returns balance en XRP (string)
	 */
	async getUserBalance(user: User): Promise<string | null> {
		if (!user.seed) return null;
		await this.xrplHelper.connect();
		try {
			const seed = this.xrplHelper.decryptSeed(user.seed);
			const wallet = Wallet.fromSeed(seed);
			return await this.xrplHelper.getBalance(wallet.classicAddress);
		} finally {
			await this.xrplHelper.disconnect();
		}
	}

	/**
	 * Envoie un paiement XRP d'un utilisateur à un autre.
	 * @param fromUser L'utilisateur qui paie
	 * @param toAddress Adresse XRPL du destinataire
	 * @param amount Montant en XRP
	 * @returns Résultat de la transaction
	 */
	async sendPaymentFromUser(
		fromUser: User,
		toAddress: string,
		amount: string | number,
	): Promise<any> {
		if (!fromUser.seed) throw new Error('Utilisateur sans seed XRPL');
		if (!toAddress) {
			console.error('[XRPL] Adresse de destination manquante');
			throw new Error('Adresse de destination XRPL manquante');
		}
		const fromAddress = this.getAddressFromUser(fromUser);
		await this.xrplHelper.connect();
		try {
			const seed = this.xrplHelper.decryptSeed(fromUser.seed);
			console.log('[XRPL] Paiement', {
				from: fromAddress,
				to: toAddress,
				amount,
			});
			return await this.xrplHelper.sendPayment(seed, toAddress, amount);
		} finally {
			await this.xrplHelper.disconnect();
		}
	}

	/**
	 * Retourne l'adresse XRPL (classicAddress) d'un utilisateur à partir de sa seed.
	 * @param user L'utilisateur concerné
	 * @returns Adresse XRPL (classicAddress) ou null
	 */
	getAddressFromUser(user: User): string | null {
		if (!user.seed) return null;
		const seed = this.xrplHelper.decryptSeed(user.seed);
		const wallet = Wallet.fromSeed(seed);
		return wallet.classicAddress;
	}

	/**
	 * Mint un NFT d'accès à une ressource pour un utilisateur.
	 * @param user Acheteur
	 * @param resourceId ID de la ressource
	 * @param resourceTitle Titre de la ressource (optionnel)
	 * @returns Résultat de la transaction
	 */
	async mintNftForResource(user: User, resourceId: string): Promise<any> {
		await this.xrplHelper.connect();
		try {
			const backendSeed = process.env.XRPL_BACKEND_SEED;
			if (!backendSeed) throw new Error('XRPL_BACKEND_SEED non défini');
			const userAddress = this.getAddressFromUser(user);
			if (!userAddress) throw new Error('Utilisateur sans adresse XRPL');
			// On construit l'URL HTTP du endpoint de métadonnées
			const metadataUrl = `${process.env.BACK_URL}/resources/${resourceId}/nft-metadata`;
			// A revoir:
			const uri = convertStringToHex(metadataUrl);
			// 1. Mint par le backend
			const mintResult = await this.xrplHelper.mintNft(
				backendSeed,
				uri,
				0,
				1,
			);
			// Récupérer l'ID du NFT minté
			const nftId =
				mintResult.result?.meta?.nftoken_id ||
				mintResult.result?.meta?.NFTokenID ||
				mintResult.result?.NFTokenID ||
				(mintResult.result?.meta?.AffectedNodes || []).find(
					(n: any) => n.CreatedNode?.LedgerEntryType === 'NFToken',
				)?.CreatedNode?.NewFields?.NFTokenID;
			if (!nftId)
				throw new Error("Impossible de récupérer l'ID du NFT minté");
			// 2. Transfert à l'utilisateur
			const userSeed = this.xrplHelper.decryptSeed(user.seed);
			console.log('[XRPL] Seed utilisateur déchiffrée:', userSeed);
			if (!/^s[0-9A-Za-z]{15,}$/.test(userSeed)) {
				console.error('[XRPL] Seed utilisateur invalide !', userSeed);
				throw new Error('Seed XRPL utilisateur invalide ou corrompue');
			}
			try {
				const Wallet = require('xrpl').Wallet;
				const testWallet = Wallet.fromSeed(userSeed);
				console.log(
					'[XRPL] Wallet utilisateur OK:',
					testWallet.classicAddress,
				);
			} catch (err) {
				console.error(
					'[XRPL] Erreur lors de la création du wallet utilisateur avec la seed:',
					userSeed,
					err,
				);
				throw err;
			}
			const transferResult = await this.xrplHelper.transferNft(
				backendSeed,
				nftId,
				userSeed,
			);
			return { mintResult, nftId, transferResult };
		} finally {
			await this.xrplHelper.disconnect();
		}
	}

	/**
	 * Vérifie si un utilisateur possède un NFT d'accès à une ressource.
	 * @param user Utilisateur
	 * @param resourceId ID de la ressource
	 * @returns true/false
	 */
	async hasNftForResource(user: User, resourceId: string): Promise<boolean> {
		if (!user.seed) return false;
		await this.xrplHelper.connect();
		try {
			const seed = this.xrplHelper.decryptSeed(user.seed);
			const wallet = Wallet.fromSeed(seed);
			const nfts = await this.xrplHelper.getAccountNfts(
				wallet.classicAddress,
			);
			// Adresse XRPL du backend
			const expectedIssuer = this.getBackendMinterAddress();
			return nfts.some((nft: any) => {
				try {
					const meta = (() => {
						// URI peut être hex d'une URL ou d'un JSON, on tente les deux
						const str = Buffer.from(nft.URI, 'hex').toString();
						try {
							return JSON.parse(str);
						} catch {
							return str;
						}
					})();
					const isResourceNft =
						typeof meta === 'object'
							? meta.resourceId === resourceId
							: typeof meta === 'string' &&
								meta.includes(resourceId);
					return isResourceNft && nft.Issuer === expectedIssuer;
				} catch {
					return false;
				}
			});
		} finally {
			await this.xrplHelper.disconnect();
		}
	}

	// Méthode utilitaire pour obtenir l'adresse XRPL minteur du backend
	getBackendMinterAddress(): string | null {
		const backendSeed = process.env.XRPL_BACKEND_SEED;
		if (!backendSeed) return null;
		const wallet = Wallet.fromSeed(backendSeed);
		return wallet.classicAddress;
	}

	/**
	 * Retourne les infos d'un wallet XRPL à partir d'une seed chiffrée.
	 * @param encryptedSeed Seed XRPL chiffrée
	 * @returns Infos du wallet (classicAddress, seed, balance, nfts)
	 */
	async getWalletInfo(encryptedSeed: string): Promise<any> {
		await this.xrplHelper.connect();
		try {
			const decryptedSeed = this.xrplHelper.decryptSeed(encryptedSeed);
			const Wallet = require('xrpl').Wallet;
			const wallet = Wallet.fromSeed(decryptedSeed);
			const address = wallet.classicAddress;
			const privateKey = wallet.privateKey;
			const secretKey = wallet.secretKey;
			const publicKey = wallet.publicKey;
			const balance = await this.xrplHelper.getBalance(address);
			const nfts = await this.xrplHelper.getAccountNfts(address);
			return {
				classicAddress: address,
				seed: decryptedSeed,
				privateKey,
				secretKey,
				publicKey,
				balance,
				nfts,
			};
		} finally {
			await this.xrplHelper.disconnect();
		}
	}
}
