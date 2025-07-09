import { Injectable, Logger } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AnalysisResult } from './schemas/analysis-result.schema';
import { Long } from 'bson';
@Injectable()
export class AnalysisService {
	private readonly logger = new Logger(AnalysisService.name);
	constructor(@InjectModel(AnalysisResult.name) private analysisModel: Model<AnalysisResult>) {}

	create(createAnalysisDto: CreateAnalysisDto) {
		return this.analysisModel.create(createAnalysisDto);
	}

	findAll() {
		return this.analysisModel.find().exec();
	}

	findOne(id: number) {
		return `This action returns a #${id} analysis`;
	}
	async findById(id: string) {
		return this.analysisModel.findById(id).exec();
	}
	findByDiscordScope(serverId: string, channelId: string, promptKey: string): Promise<AnalysisResult | null> {
		if (typeof promptKey !== 'string') {
            throw new Error('Invalid promptKey: must be a string');
        }
		return this.analysisModel.findOne({

				platform: "discord",
				"scope": {
					"server_id": serverId,
					"channel_id": channelId,
				},
				prompt_key: { $eq: promptKey },
			
			})
			.sort({created_at: -1})
			.lean();
		}
	findByDiscordServer(serverId: string, promptKey: string): Promise<AnalysisResult[]> {
		if (typeof promptKey !== 'string') {
            throw new Error('Invalid promptKey: must be a string');
        }
		return this.analysisModel
		.find({
			platform: 'discord',
			'scope.server_id': serverId,
			prompt_key: { $eq: promptKey },
		})
		.sort({ created_at: -1 })
		.limit(10)
		.lean()
		.exec();
	}
	update(id: number, updateAnalysisDto: UpdateAnalysisDto) {
		return `This action updates a #${id} analysis`;
	}

	remove(id: number) {
		return `This action removes a #${id} analysis`;
	}
}
