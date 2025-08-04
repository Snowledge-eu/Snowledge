import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { Logger } from '@nestjs/common';
import { DiscordHarvestJobHelper } from '../helpers/discord-harvest-job.helper';
import { DiscordHelper } from '../helpers/discord.helper';
// import { DiscordClientService } from '../services/discord-client.service';
// import { DiscordHarvesterService } from './discord-harvester.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const logger = new Logger('HarvesterWorker');

  const discordHelper = app.get(DiscordHelper);
  const jobHelper = app.get(DiscordHarvestJobHelper);

  await discordHelper.connect(); // ✅ se connecte et attend 'ready'

  logger.log(`[Worker] Discord client connecté.`);

  while (true) {
    await jobHelper.processPendingJobs();
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

bootstrap();
