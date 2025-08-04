import { Injectable, Logger } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { PayloadBuilder } from './llm/payload-builder';
import { OvhClient } from './llm/call-ovh-api';
import { Analysis } from './entities/analysis.entity';

@Injectable()
export class AnalysisHelper {
	private readonly logger = new Logger(AnalysisHelper.name);
		constructor(
		private readonly analysisService: AnalysisService,
		private readonly payloadBuilder: PayloadBuilder,
		private readonly ovhClient: OvhClient
	) {}

	async analyse(input: {
		modelName: string;
		promptKey: string;
		userContent: string[] | string;
	}): Promise<any> {
		try {
			const payload = await this.payloadBuilder.buildPayload(
				input.modelName,
				input.promptKey,
				input.userContent
			);
			return this.ovhClient.callOvhApi(payload);
		} catch (error) {
			this.logger.error('Error in analyse method:', error);
			throw error; // Relancer l'erreur
		}
	}
	async trendToContent(input: {
		modelName: string;
		promptKey: string;
		trend: any;
	}){
		try {
			const payload = await this.payloadBuilder.buildPayloadForContent(
				input.modelName,
				input.promptKey,
				input.trend
			);
			return this.ovhClient.callOvhApi(payload);
		} catch (error) {
			this.logger.error('Error in trendToContent method:', error);
			throw error; // Relancer l'erreur
		}
	}
	async saveAnalysis(data: any): Promise<Analysis> {
		// À adapter selon ton ORM ou accès Mongo/Mongoose :
		const created = await this.analysisService.create({
			...data,
			created_at: new Date(),
		});
		return created.toObject()
	}
}
