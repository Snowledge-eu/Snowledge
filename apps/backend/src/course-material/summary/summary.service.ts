import { Injectable } from '@nestjs/common';
import { UpdateSummaryDto } from './dto/update-summary.dto';
import { SummaryResult } from './schemas/summary.schema';
import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SummaryService {
	constructor(
		@InjectModel(SummaryResult.name)
		private summaryModel: Model<SummaryResult>,
	) {}
	async create(data: any) {
		const created = new this.summaryModel(data);
		return created.save();
	}

	findAll(): Promise<Array<SummaryResult>> {
		return this.summaryModel.find().lean();
	}

	findOneByAnalysisIdAndTrendId(
		analyseId: string,
		trendId: number,
	): Promise<SummaryResult | null> {
		return this.summaryModel
			.findOne({
				platform: 'discord',
				source_analysis_id: new mongoose.Types.ObjectId(analyseId),
				'scope.trend_id': { $exists: true, $eq: String(trendId) }, // ← Convertir en string
				prompt_key: 'trend_to_content',
			})
			.sort({ createdAt: -1 })
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
