import { Injectable } from '@nestjs/common';
import { DiscordHarvestJob } from '../schemas/discord-harvest-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DiscordHarvestJobService {
	constructor(
		@InjectModel(DiscordHarvestJob.name) private harvestJobModel: Model<DiscordHarvestJob>,
	) {}

	findLastHarvestJobByDiscordServerId(guildId: string): Promise<DiscordHarvestJob> {
		return this.harvestJobModel
			.findOne()
			.where({ serverId: guildId })
			.sort({ created_at: 'asc' })
			.exec();
	}
}
