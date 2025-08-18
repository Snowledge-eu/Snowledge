import { Injectable, Logger } from '@nestjs/common';
import { DiscordHarvestJob } from '../schemas/discord-harvest-job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Long } from 'bson';
import { DiscordHarvestDto } from '../dto/discord-harvest.dto';

@Injectable()
export class DiscordHarvestJobService {
		private readonly logger = new Logger(DiscordHarvestJobService.name);
	constructor(
		@InjectModel(DiscordHarvestJob.name) private harvestJobModel: Model<DiscordHarvestJob>,
	) {}

	async addJob(dto: DiscordHarvestDto): Promise<string> {
		try {
			const jobData: any = {
				...dto,
				status: 'pending',
				created_at: new Date()
			};
	
			const created = new this.harvestJobModel(jobData);
			const saved = await created.save();
			return saved._id.toString();
		} catch (error) {
			this.logger.error(error);
		}
	}
	findAll() {
		return this.harvestJobModel.find().exec();
	}
	findLastHarvestJobByDiscordServerId(guildId: string): Promise<DiscordHarvestJob> {
		return this.harvestJobModel
			.findOne()
			.where({ serverId: guildId, inserted: { $gt: 0} })
			.sort({ created_at: 'desc' })
			.lean();
	}
	async getNextPendingJob(): Promise<DiscordHarvestJob | null> {
		return this.harvestJobModel.findOneAndUpdate(
			{ status: 'pending' },
			{ $set: { status: 'processing', started_at: new Date() } },
			{ sort: { created_at: 1 }, returnDocument: 'after' }
		).lean();
	}

	async updateJobStatus(
		jobId: string | Types.ObjectId,
		status: string,
		extra: Partial<any> = {}
	): Promise<void> {
		await this.harvestJobModel.updateOne(
			{ _id: new Types.ObjectId(jobId) },
			{
				$set: {
				status,
				finished_at: new Date(),
				...extra,
				},
			}
		);
	}
	async addHarvestJob(data: any): Promise<string> {
		const result = await this.harvestJobModel.create({
			...data,
			status: 'pending',
			created_at: new Date(),
		});
		return result._id.toString();
	}
}
