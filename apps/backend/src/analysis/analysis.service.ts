import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AnalysisResult } from './schemas/analysis-result.schema';
import { Long } from 'bson';
@Injectable()
export class AnalysisService {
  	constructor(@InjectModel(AnalysisResult.name) private analysisModel: Model<AnalysisResult>) {}

  create(createAnalysisDto: CreateAnalysisDto) {
    return 'This action adds a new analysis';
  }

	findAll() {
		return this.analysisModel.find().exec();
	}

  findOne(id: number) {
    return `This action returns a #${id} analysis`;
  }

  findByDiscordScope(serverId: string, channelId: string, promptKey: string): Promise<AnalysisResult | null> {
		return this.analysisModel.findOne({
      where: {
        platform: "discord",
        "scope": {
          "server_id": Long.fromString(serverId),
          "channel_id": Long.fromString(channelId),
        },
        prompt_key: promptKey,
      }
    })
    .sort({createdAt: -1})
    .lean();
	}
  findByDiscordServer(serverId: string, promptKey: string): Promise<AnalysisResult[]> {
    return this.analysisModel
      .find({
        platform: 'discord',
        'scope.server_id': Long.fromString(serverId),
        prompt_key: promptKey,
      })
      .sort({ createdAt: -1 })
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
