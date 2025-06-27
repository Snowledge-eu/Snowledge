import { Injectable } from '@nestjs/common';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';
import { SummaryResult } from './schemas/summary.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SummaryService {
  constructor(@InjectModel(SummaryResult.name) private summaryModel: Model<SummaryResult>) {}
  create(createSummaryDto: CreateSummaryDto) {
    return 'This action adds a new summary';
  }

  findAll(): Promise<Array<SummaryResult>> {
    return this.summaryModel.find().lean();
  }

  findOneByAnalysisIdAndTrendId(analyseId: string, trendId: number): Promise<SummaryResult | null> {
    console.log(new mongoose.Types.ObjectId(analyseId))
    console.log('---> AnalyseId:', analyseId, mongoose.isValidObjectId(analyseId))
    return this.summaryModel.findOne({          
        platform: "discord",
        source_analysis_id: analyseId,
        "scope.trend_id": { $exists: true, $eq: Number(trendId) },
        prompt_key: 'trend_to_content',      
      })
      .sort({createdAt: -1})
      .lean()
      .exec();

  }

  update(id: number, updateSummaryDto: UpdateSummaryDto) {
    return `This action updates a #${id} summary`;
  }

  remove(id: number) {
    return `This action removes a #${id} summary`;
  }
}
