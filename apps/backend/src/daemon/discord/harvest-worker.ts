/**
 * Discord Harvest Worker
 * 
 * Worker alternatif pour le traitement des jobs Discord.
 * Utilise le DiscordHarvestJobHelper pour une approche plus modulaire.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Logger } from '@nestjs/common';
import { DiscordHarvestJobHelper } from '../../discord/helpers/discord-harvest-job.helper';
import { DiscordHelper } from '../../discord/helpers/discord.helper';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('DiscordHarvestWorker');

  const discordHelper = app.get(DiscordHelper);
  const jobHelper = app.get(DiscordHarvestJobHelper);

  await discordHelper.connect();
  logger.log('[Discord Worker] Discord client connecté.');

  while (true) {
    await jobHelper.processPendingJobs();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

bootstrap(); 