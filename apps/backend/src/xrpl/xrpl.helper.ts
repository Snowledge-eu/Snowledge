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
		await this.connect();
		const client = this.getClient();
		const accountInfo = await client.request({
			command: 'account_info',
			account: address,
		});
		await this.disconnect();
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
		await this.connect();
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
		await this.disconnect();
		return result;
	}
}
