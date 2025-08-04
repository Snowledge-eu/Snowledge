// src/discord/services/discord-client.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordClientHelper implements OnModuleInit, OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
    });
  }

  async onModuleInit(): Promise<void> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      throw new Error('DISCORD_BOT_TOKEN is not defined in environment variables');
    }

    await this.client.login(token);
    console.log(`[DiscordClientService] Connected as ${this.client.user?.tag}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.destroy();
    console.log('[DiscordClientService] Disconnected.');
  }

  getClient(): Client {
    return this.client;
  }
}
