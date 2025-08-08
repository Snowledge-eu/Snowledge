import { Injectable } from '@nestjs/common';
import { PromptProvider } from '../../prompt/prompt.provider';
import { estimateTokenCount } from './token-utils';

// Constantes pour la configuration des modèles
const DEFAULT_CONTEXT_WINDOW = 128000;
const DEFAULT_RESERVE_TOKENS = 2048;
const DEFAULT_TEMPERATURE = 0.3;
const DEFAULT_TOP_P = 0.8;

@Injectable()
export class PayloadBuilder {
	constructor(private readonly promptProvider: PromptProvider) {}

	async getPromptConfig(promptName: string): Promise<any> {
		return this.promptProvider.getPromptByName(promptName);
	}

	private async buildPayloadCore(
		modelName: string,
		customPrompt: any,
		contentReplacer: (content: string) => string,
		stream = false,
		extra: any = {},
	): Promise<any> {
		// Étape 1 : construction brute avec le prompt personnalisé
		const rawMessages = customPrompt.messages.map((msg: any) => {
			let content = msg.content;
			content = contentReplacer(content);
			return {
				role: msg.role,
				content,
			};
		});

		// Estimation tokens avec estimateTokenCount
		const promptTokens = await estimateTokenCount(rawMessages, modelName);
		console.log('promptTokens', promptTokens);
		const availableForCompletion = Math.max(
			DEFAULT_CONTEXT_WINDOW - promptTokens,
			0,
		);
		const maxTokens = Math.min(
			availableForCompletion,
			DEFAULT_RESERVE_TOKENS,
		);

		console.log('maxTokens', maxTokens);

		// Étape 2 : insertion max_tokens dans {{...}}
		const messages = rawMessages.map((msg) => ({
			role: msg.role,
			content: msg.content.replace('{{max_tokens}}', `${maxTokens}`),
		}));

		// Final payload
		const payload: any = {
			model: modelName,
			messages,
			temperature:
				parseFloat(customPrompt.temperature) ?? DEFAULT_TEMPERATURE,
			top_p: parseFloat(customPrompt.top_p) ?? DEFAULT_TOP_P,
			stream,
			max_tokens: maxTokens,
		};

		// Ne pas inclure response_format s'il est vide ou mal formaté
		if (
			customPrompt.response_format &&
			customPrompt.response_format.type &&
			customPrompt.response_format.json_schema
		) {
			payload.response_format = customPrompt.response_format;
		}

		if (extra) {
			Object.assign(payload, extra);
		}

		return payload;
	}

	async buildPayloadWithCustomPrompt(
		modelName: string,
		customPrompt: any,
		userContent: string[] | string,
		stream = false,
		extra: any = {},
	): Promise<any> {
		const userStr = Array.isArray(userContent)
			? userContent.join('\n')
			: userContent;

		return this.buildPayloadCore(
			modelName,
			customPrompt,
			(content) =>
				content.replace(/{{(question|messages|trend)}}/g, userStr),
			stream,
			extra,
		);
	}

	async buildPayloadForContent(
		modelName: string,
		customPrompt: any,
		trend: any,
		stream = false,
		extra: any = {},
	): Promise<any> {
		const trendJson = JSON.stringify(trend, null, 2);

		return this.buildPayloadCore(
			modelName,
			customPrompt,
			(content) => content.replace('{{trend}}', trendJson),
			stream,
			extra,
		);
	}
}
