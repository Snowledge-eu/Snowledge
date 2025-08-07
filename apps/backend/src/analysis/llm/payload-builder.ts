import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';
import { estimateTokenCount } from './token-utils'; // à créer ou adapter
import { Injectable } from '@nestjs/common';
import { PromptManagerService } from './prompt-manager.service';

@Injectable()
export class PayloadBuilder {
	constructor(private readonly promptManager: PromptManagerService) {}

	loadYaml(filePath: string): any {
		const raw = fs.readFileSync(filePath, 'utf-8');
		return yaml.parse(raw);
	}

	getModelConfig(modelName: string): any {
		const configPath = path.join(
			process.cwd(),
			'src/analysis/llm/llm_models.yaml',
		);
		const config = this.loadYaml(configPath);
		for (const section of ['llm_models', 'lrm_models', 'vlm_models']) {
			for (const model of config[section] || []) {
				if (model.name === modelName) {
					return model;
				}
			}
		}
		throw new Error(`Model '${modelName}' not found`);
	}

	async getPromptConfig(promptName: string): Promise<any> {
		return this.promptManager.getPromptByName(promptName);
	}

	async buildPayload(
		modelName: string,
		promptName: string,
		userContent: string[] | string,
		stream = false,
		extra: any = {},
	): Promise<any> {
		const modelConfig = this.getModelConfig(modelName);
		const promptConfig = await this.getPromptConfig(promptName);

		const userStr = Array.isArray(userContent)
			? userContent.join('\n')
			: userContent;

		// Étape 1 : construction brute
		const rawMessages = promptConfig.messages.map((msg: any) => {
			let content = msg.content;
			content = content.replace(
				/{{(question|messages|trend)}}/g,
				userStr,
			);
			return {
				role: msg.role,
				content,
			};
		});

		// Estimation tokens
		const promptTokens = await estimateTokenCount(
			rawMessages,
			modelConfig.name,
		);
		const contextWindow = modelConfig.context_window || 4096;
		const reserve = 2048;
		const availableForCompletion = Math.max(
			contextWindow - promptTokens,
			0,
		);
		const maxTokens = Math.min(availableForCompletion, reserve);

		// Étape 2 : insertion max_tokens dans {{...}}
		const messages = rawMessages.map((msg) => ({
			role: msg.role,
			content: msg.content.replace('{{max_tokens}}', `${maxTokens}`),
		}));

		// Final payload
		const payload: any = {
			model: modelConfig.name,
			messages,
			temperature:
				parseFloat(promptConfig.temperature) ??
				modelConfig.temperature ??
				0.3,
			top_p: parseFloat(promptConfig.top_p) ?? modelConfig.top_p ?? 0.8,
			stream,
			max_tokens: maxTokens,
		};

		if (promptConfig.response_format) {
			payload.response_format = promptConfig.response_format;
		}

		if (extra) {
			Object.assign(payload, extra);
		}

		return payload;
	}
	async buildPayloadForContent(
		modelName: string,
		promptName: string,
		trend: any,
		stream = false,
		extra: any = {},
	): Promise<any> {
		const modelConfig = this.getModelConfig(modelName);
		const promptConfig = await this.getPromptConfig(promptName);

		const trendJson = JSON.stringify(trend, null, 2);

		const messages = promptConfig.messages.map((msg: any) => ({
			role: msg.role,
			content: msg.content.replace('{{trend}}', trendJson),
		}));

		const payload: any = {
			max_tokens: modelConfig.context_window || 512,
			model: modelConfig.name,
			messages,
			temperature:
				parseFloat(promptConfig.temperature) ??
				modelConfig.temperature ??
				0.3,
			top_p: parseFloat(promptConfig.top_p) ?? modelConfig.top_p ?? 0.8,
			stream,
		};

		if (promptConfig.response_format) {
			payload.response_format = promptConfig.response_format;
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
		const modelConfig = this.getModelConfig(modelName);

		const userStr = Array.isArray(userContent)
			? userContent.join('\n')
			: userContent;

		// Étape 1 : construction brute avec le prompt personnalisé
		const rawMessages = customPrompt.messages.map((msg: any) => {
			let content = msg.content;
			content = content.replace(
				/{{(question|messages|trend)}}/g,
				userStr,
			);
			return {
				role: msg.role,
				content,
			};
		});

		// Estimation tokens
		const promptTokens = await estimateTokenCount(
			rawMessages,
			modelConfig.name,
		);
		const contextWindow = modelConfig.context_window || 4096;
		const reserve = 2048;
		const availableForCompletion = Math.max(
			contextWindow - promptTokens,
			0,
		);
		const maxTokens = Math.min(availableForCompletion, reserve);

		// Étape 2 : insertion max_tokens dans {{...}}
		const messages = rawMessages.map((msg) => ({
			role: msg.role,
			content: msg.content.replace('{{max_tokens}}', `${maxTokens}`),
		}));

		// Final payload
		const payload: any = {
			model: modelConfig.name,
			messages,
			temperature:
				parseFloat(customPrompt.temperature) ??
				modelConfig.temperature ??
				0.3,
			top_p: parseFloat(customPrompt.top_p) ?? modelConfig.top_p ?? 0.8,
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
}
