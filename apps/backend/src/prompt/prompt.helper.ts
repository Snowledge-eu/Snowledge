import { Injectable } from '@nestjs/common';
import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PromptHelper {
	async loadYamlPrompts(): Promise<any> {
		const yamlPath = path.join(
			__dirname,
			'../analysis/llm/prompt_models.yaml',
		);
		const fileContents = fs.readFileSync(yamlPath, 'utf8');
		return yaml.load(fileContents) as any;
	}

	formatPromptForAnalysis(prompt: any): any {
		return {
			name: prompt.name,
			description: prompt.description,
			platform: prompt.platform,
			temperature: prompt.temperature,
			top_p: prompt.top_p,
			messages: prompt.messages,
			response_format: prompt.response_format,
		};
	}

	validatePromptStructure(prompt: any): boolean {
		return !!(
			(
				prompt.name &&
				prompt.description &&
				prompt.platform &&
				prompt.temperature !== undefined &&
				prompt.top_p !== undefined &&
				prompt.messages
			)
			// response_format est optionnel
		);
	}
}
