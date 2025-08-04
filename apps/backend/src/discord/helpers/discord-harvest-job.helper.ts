import { Injectable, Logger } from '@nestjs/common';
import { DiscordMessageService } from '../services/discord-message.service';
import { TextChannel } from 'discord.js';
import { DiscordHarvestJobService } from '../services/discord-harvest-job.service';
import { DiscordClientHelper } from './discord-client.helper';

@Injectable()
export class DiscordHarvestJobHelper {
  private readonly logger = new Logger(DiscordHarvestJobHelper.name);

  constructor(
    private readonly discordClientHelper: DiscordClientHelper,
    private readonly discordHarvestJobService: DiscordHarvestJobService,
    private readonly discordMessageService: DiscordMessageService,
  ) {}

  async processPendingJobs() {
    const job = await this.discordHarvestJobService.getNextPendingJob();
    if (!job) return;

    try {
      const client = this.discordClientHelper.getClient();
      const guild = await client.guilds.fetch(job.serverId.toString());
      const channels = job.channels.map((id) => guild.channels.cache.get(id.toString())).filter((ch): ch is TextChannel => ch?.isTextBased());

      const allMessages = [];

      for (const channel of channels) {
        const historyOptions = { limit: 100, oldest: true, ...(job.after && { after: this.dateToSnowflake(job.after) }),
        ...(job.before && { before: this.dateToSnowflake(job.before) }), };
        // if (job.after) { // && /^\d+$/.test(job.after)
        //   historyOptions.after = job.after;
        // }

        const fetchedMessages = await channel.messages.fetch(historyOptions);
        const messages = [];

        for (const msg of fetchedMessages.values()) {
          let content = msg.content;
          if (msg.attachments.size > 0) {
            content += ` [Attachments: ${[...msg.attachments.values()].map((a) => a.url).join(', ')}]`;
          }
          if (msg.embeds.length > 0) {
            content += ' [Embeds present]';
          }
          if (!content.trim()) continue;

          messages.push({
            _id: msg.id,
            channel_id: msg.channel.id,
            parent_message_id: msg.reference?.messageId || null,
            author_name: msg.member?.displayName || msg.author.username,
            author_user_id: msg.author.id,
            content,
            created_at_by_discord: msg.createdAt,
            fetched_at: new Date(),
          });
        }

        allMessages.push(...messages);
      }

      const insertedCount = await this.discordMessageService.saveIfNew(allMessages);
      await this.discordHarvestJobService.updateJobStatus(job._id.toString(), 'done', { inserted: insertedCount });
      this.logger.log(`Job ${job._id} completed with ${insertedCount} new messages`);
    } catch (err: any) {
      await this.discordHarvestJobService.updateJobStatus(job._id.toString(), 'fail', { error: (err as Error).message});
      this.logger.error(`Job ${job._id} failed`, err.stack);
    }
  }
     dateToSnowflake(date: Date): string {
        return ((BigInt(date.valueOf()) - BigInt(1420070400000)) << BigInt(22)).toString();
    }
}
