import { Injectable } from '@nestjs/common';
import { Client } from 'xrpl';
import * as crypto from 'crypto';

/**
 * Helper XRPL pour la gestion du client et des utilitaires de chiffrement de seed.
 *
 * En production, XRPL_SEED_KEY doit être une clé base64 de 32 bytes (générée par head -c 32 /dev/urandom | base64).
 *
 * En développement/local/test, si la variable n'est pas définie, on utilise une clé base64 EXEMPLE, publique, codée en dur :
 *   'iGhnpOgO79e9VGGDhGZCNKYlWFjnZXPrEW9O+ffXxvc='
 * Cette clé n'est là que pour faciliter le développement, elle N'EST PAS SÉCURISÉE et ne doit JAMAIS être utilisée en production.
 */
@Injectable()
export class XrplHelper {
	private client: Client;

	// Gestion universelle de la clé de chiffrement
	private static getEncryptionKey(): Buffer {
		if (process.env.XRPL_SEED_KEY) {
			// En prod : clé base64 (32 bytes)
			return Buffer.from(process.env.XRPL_SEED_KEY, 'base64');
		}
		// En dev/test : clé base64 EXEMPLE, publique, NON SÉCURISÉE, à ne jamais utiliser en prod !
		// Elle sert uniquement à faire tourner l'app en local ou CI facilement.
		return Buffer.from(
			'iGhnpOgO79e9VGGDhGZCNKYlWFjnZXPrEW9O+ffXxvc=',
			'base64',
		);
	}

	constructor() {
		this.client = new Client('wss://s.altnet.rippletest.net:51233');
	}

	getClient(): Client {
		return this.client;
	}

	async connect() {
		if (!this.client.isConnected()) {
			await this.client.connect();
		}
	}

	async disconnect() {
		if (this.client.isConnected()) {
			await this.client.disconnect();
		}
	}

	async ensureConnected() {
		if (!this.client.isConnected()) {
			await this.client.connect();
		}
	}

	/**
	 * Chiffre une seed XRPL avec AES-256-CBC.
	 *
	 * Justification :
	 * - On génère un IV (vecteur d'initialisation) aléatoire à chaque chiffrement pour garantir que deux seeds identiques ne donneront jamais le même résultat chiffré.
	 * - Le IV n'est pas un secret : il est stocké avec la donnée chiffrée, séparé par un ':'.
	 * - Cette pratique est standard et permet de rendre chaque chiffrement unique, même avec la même clé et la même seed.
	 *
	 * @param text La seed à chiffrer
	 * @returns La seed chiffrée sous la forme "iv:payload"
	 */
	encryptSeed(text: string): string {
		const ENCRYPTION_KEY = XrplHelper.getEncryptionKey();
		const IV_LENGTH = 16;
		const iv = crypto.randomBytes(IV_LENGTH);
		const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
		let encrypted = cipher.update(text);
		encrypted = Buffer.concat([encrypted, cipher.final()]);
		// On retourne le IV et la donnée chiffrée, séparés par ':'
		return iv.toString('hex') + ':' + encrypted.toString('hex');
	}

	/**
	 * Déchiffre une seed XRPL chiffrée avec AES-256-CBC.
	 *
	 * Justification :
	 * - Le IV est stocké avec la donnée chiffrée (dans la même chaîne, séparé par ':').
	 * - Lors du déchiffrement, on relit le IV et la donnée chiffrée, puis on utilise la clé secrète pour retrouver la seed en clair.
	 * - Cette méthode permet de garantir la sécurité et l'unicité de chaque chiffrement.
	 *
	 * @param encryptedText La seed chiffrée ("iv:payload")
	 * @returns La seed en clair
	 */
	decryptSeed(encryptedText: string): string {
		const ENCRYPTION_KEY = XrplHelper.getEncryptionKey();
		const textParts = encryptedText.split(':');
		const iv = Buffer.from(textParts[0], 'hex');
		const encrypted = Buffer.from(textParts[1], 'hex');
		const decipher = crypto.createDecipheriv(
			'aes-256-cbc',
			ENCRYPTION_KEY,
			iv,
		);
		let decrypted = decipher.update(encrypted);
		decrypted = Buffer.concat([decrypted, decipher.final()]);
		return decrypted.toString();
	}

	/**
	 * Récupère la balance XRP d'un compte XRPL (classicAddress).
	 * @param address Adresse XRPL (classicAddress)
	 * @returns balance en XRP (string)
	 */
	async getBalance(address: string): Promise<string> {
		await this.ensureConnected();
		const client = this.getClient();
		const accountInfo = await client.request({
			command: 'account_info',
			account: address,
		});
		return (
			Number(accountInfo.result.account_data.Balance) / 1_000_000
		).toFixed(6); // XRP
	}

	/**
	 * Envoie un paiement XRP d'un wallet à un autre.
	 * @param fromSeed Seed XRPL du wallet source
	 * @param toAddress Adresse XRPL (classicAddress) du destinataire
	 * @param amount Montant en XRP (string ou number)
	 * @returns Résultat de la transaction
	 */
	async sendPayment(
		fromSeed: string,
		toAddress: string,
		amount: string | number,
	): Promise<any> {
		await this.ensureConnected();
		const client = this.getClient();
		const wallet = require('xrpl').Wallet.fromSeed(fromSeed);
		const payment = await client.autofill({
			TransactionType: 'Payment',
			Account: wallet.classicAddress,
			Amount: (Number(amount) * 1_000_000).toFixed(0), // XRP -> drops
			Destination: toAddress,
		});
		const signed = wallet.sign(payment);
		const result = await client.submitAndWait(signed.tx_blob);
		return result;
	}

	/**
	 * Mint un NFT XRPL pour un compte donné.
	 * @param fromSeed Seed XRPL du wallet source (minteur)
	 * @param uri URI ou métadonnée (ex: resourceId encodé en hex)
	 * @param taxon Taxon du NFT (0 par défaut)
	 * @param flags Flags XRPL (1 = burnable, etc.)
	 * @returns Résultat de la transaction
	 */
	async mintNft(
		fromSeed: string,
		uri: string,
		taxon = 0,
		flags = 1,
	): Promise<any> {
		await this.ensureConnected();
		const client = this.getClient();
		const wallet = require('xrpl').Wallet.fromSeed(fromSeed);
		const tx = await client.autofill({
			TransactionType: 'NFTokenMint',
			Account: wallet.classicAddress,
			NFTokenTaxon: taxon,
			Flags: flags,
			URI: uri, // doit être encodé en hex !
		});
		const signed = wallet.sign(tx);
		const result = await client.submitAndWait(signed.tx_blob);
		return result;
	}

	/**
	 * Récupère tous les NFTs d'un compte XRPL.
	 * @param address Adresse XRPL (classicAddress)
	 * @returns Liste des NFTs (array)
	 */
	async getAccountNfts(address: string): Promise<any[]> {
		await this.ensureConnected();
		const client = this.getClient();
		const nfts = await client.request({
			command: 'account_nfts',
			account: address,
		});
		return nfts.result.account_nfts || [];
	}

	/**
	 * Crée une offre de transfert NFT XRPL (sell offer à 0 XRP).
	 * @private
	 */
	private async createNftTransferOffer(
		client: Client,
		backendWallet: any,
		nftId: string,
		destination: string,
	): Promise<any> {
		await this.ensureConnected();
		const offerTx = await client.autofill({
			TransactionType: 'NFTokenCreateOffer',
			Account: backendWallet.classicAddress,
			NFTokenID: nftId,
			Amount: '0',
			Destination: destination,
			Flags: 1, // tfSellNFTokenOffer
		});
		const signedOffer = backendWallet.sign(offerTx);
		const offerResult = await client.submitAndWait(signedOffer.tx_blob);
		const offerId =
			offerResult.result?.NFTokenOfferId ||
			offerResult.result?.offer_id ||
			offerResult.result?.meta?.AffectedNodes?.find(
				(n: any) => n.CreatedNode?.LedgerEntryType === 'NFTokenOffer',
			)?.CreatedNode?.LedgerIndex;
		if (!offerId)
			throw new Error(
				"Impossible de récupérer l'ID de l'offre de transfert NFT",
			);
		return { offerResult, offerId };
	}

	/**
	 * Accepte une offre de transfert NFT XRPL (NFTokenAcceptOffer).
	 * @private
	 */
	private async acceptNftOffer(
		client: Client,
		userWallet: any,
		offerId: string,
	): Promise<any> {
		await this.ensureConnected();
		const acceptTx = await client.autofill({
			TransactionType: 'NFTokenAcceptOffer',
			Account: userWallet.classicAddress,
			NFTokenSellOffer: offerId,
		});
		const signedAccept = userWallet.sign(acceptTx);
		return await client.submitAndWait(signedAccept.tx_blob);
	}

	/**
	 * Transfère un NFT XRPL à une adresse cible (offre de transfert + acceptation).
	 * @param fromSeed Seed XRPL du wallet source (backend)
	 * @param nftId ID du NFT à transférer
	 * @param toSeed Seed XRPL du wallet destinataire (utilisateur)
	 * @returns Résultat de la transaction d'acceptation
	 */
	async transferNft(
		fromSeed: string,
		nftId: string,
		toSeed: string,
	): Promise<any> {
		await this.ensureConnected();
		const client = this.getClient();
		const backendWallet = require('xrpl').Wallet.fromSeed(fromSeed);
		const userWallet = require('xrpl').Wallet.fromSeed(toSeed);

		// 1. Créer l'offre de transfert
		const { offerResult, offerId } = await this.createNftTransferOffer(
			client,
			backendWallet,
			nftId,
			userWallet.classicAddress,
		);

		// 2. Accepter l'offre côté destinataire
		const acceptResult = await this.acceptNftOffer(
			client,
			userWallet,
			offerId,
		);

		return { offerResult, acceptResult, offerId };
	}
}
