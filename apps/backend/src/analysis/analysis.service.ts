import { Injectable } from '@nestjs/common';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AnalysisResult } from './schemas/analysis-result.schema';

@Injectable()
export class AnalysisService {
  	constructor(@InjectModel(AnalysisResult.name) private analysisModel: Model<AnalysisResult>) {}

  create(createAnalysisDto: CreateAnalysisDto) {
    return 'This action adds a new analysis';
  }

  findAll() {
    return `This action returns all analysis`;
  }

  findOne(id: number) {
    return `This action returns a #${id} analysis`;
  }

  findByDiscordScope(serverId: string, channelId: string) {
		return this.analysisModel.findOne({
      where: {
        platform: "discord",
        "scope": {
          "server_id": serverId,
          "channel_id": channelId
        },
      }
    }).sort({createdAt: -1}).exec();
	}

  update(id: number, updateAnalysisDto: UpdateAnalysisDto) {
    return `This action updates a #${id} analysis`;
  }

  remove(id: number) {
    return `This action removes a #${id} analysis`;
  }
}
