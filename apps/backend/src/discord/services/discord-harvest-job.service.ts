import { Injectable } from '@nestjs/common';
import { DiscordHarvestJob } from '../schemas/discord-harvest-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Long } from 'bson';

@Injectable()
export class DiscordHarvestJobService {
	constructor(
		@InjectModel(DiscordHarvestJob.name) private harvestJobModel: Model<DiscordHarvestJob>,
	) {}

	findAll() {
		return this.harvestJobModel.find().exec();
	}
	findLastHarvestJobByDiscordServerId(guildId: string): Promise<DiscordHarvestJob> {
		return this.harvestJobModel
			.findOne()
			.where({ serverId: Long.fromString(guildId), inserted: { $gt: 0} })
			.sort({ created_at: 'desc' })
			.lean();
	}
}
