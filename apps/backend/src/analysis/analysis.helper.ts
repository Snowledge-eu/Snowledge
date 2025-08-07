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
		private readonly ovhClient: OvhClient,
	) {}

	async trendToContent(input: {
		modelName: string;
		promptKey: string;
		trend: any;
	}) {
		try {
			// Récupérer le prompt depuis la BD
			const prompt = await this.payloadBuilder.getPromptConfig(
				input.promptKey,
			);

			const payload = await this.payloadBuilder.buildPayloadForContent(
				input.modelName,
				prompt,
				input.trend, // Passer l'objet trend directement
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
		return created.toObject();
	}
	async analyseWithCustomPrompt(input: {
		modelName: string;
		customPrompt: any;
		userContent: string[] | string;
	}): Promise<any> {
		try {
			const payload =
				await this.payloadBuilder.buildPayloadWithCustomPrompt(
					input.modelName,
					input.customPrompt,
					input.userContent,
				);
			return this.ovhClient.callOvhApi(payload);
		} catch (error) {
			this.logger.error(
				'Error in analyseWithCustomPrompt method:',
				error,
			);
			throw error; // Relancer l'erreur
		}
	}
}
