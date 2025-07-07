import * as fs from 'fs';
import * as yaml from 'yaml';
import * as path from 'path';
import { estimateTokenCount } from './token-utils'; // à créer ou adapter
import { Injectable } from '@nestjs/common';

@Injectable()
export class PayloadBuilder {
  loadYaml(filePath: string): any {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return yaml.parse(raw);
  }

  getModelConfig(modelName: string): any {
    const configPath = path.join(process.cwd(), 'src/analysis/llm/llm_models.yaml');
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

  getPromptConfig(promptName: string): any {
    const promptPath =  path.join(process.cwd(), 'src/analysis/llm/prompt_models.yaml');
    const config = this.loadYaml(promptPath);
    if (!config.prompt_models || !config.prompt_models[promptName]) {
      throw new Error(`Prompt '${promptName}' not found`);
    }
    return config.prompt_models[promptName];
  }

  async buildPayload(
    modelName: string,
    promptName: string,
    userContent: string[] | string,
    stream = false,
    extra: any = {}
  ): Promise<any> {
    const modelConfig = this.getModelConfig(modelName);
    const promptConfig = this.getPromptConfig(promptName);

    const userStr =
      Array.isArray(userContent) ? userContent.join('\n') : userContent;

    // Étape 1 : construction brute
    const rawMessages = promptConfig.messages.map((msg: any) => {
      let content = msg.content;
      content = content.replace(/{{(question|messages|trend)}}/g, userStr);
      return {
        role: msg.role,
        content
      };
    });

    // Estimation tokens
    const promptTokens = await estimateTokenCount(
      rawMessages,
      modelConfig.name
    );
    const contextWindow = modelConfig.context_window || 4096;
    const reserve = 2048;
    const availableForCompletion = Math.max(contextWindow - promptTokens, 0);
    const maxTokens = Math.min(availableForCompletion, reserve);

    // Étape 2 : insertion max_tokens dans {{...}}
    const messages = rawMessages.map((msg) => ({
      role: msg.role,
      content: msg.content.replace('{{max_tokens}}', `${maxTokens}`)
    }));

    // Final payload
    const payload: any = {
      model: modelConfig.name,
      messages,
      temperature: promptConfig.temperature ?? modelConfig.temperature ?? 0.3,
      top_p: promptConfig.top_p ?? modelConfig.top_p ?? 0.8,
      stream,
      max_tokens: maxTokens
    };

    if (promptConfig.response_format) {
      payload.response_format = promptConfig.response_format;
    }

    if (extra) {
      Object.assign(payload, extra);
    }

    return payload;
  }
}
