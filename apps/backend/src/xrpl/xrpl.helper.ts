import { Injectable } from '@nestjs/common';
import { Client } from 'xrpl';

@Injectable()
export class XrplHelper {
	private client: Client;

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
}
