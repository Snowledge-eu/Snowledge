import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { DiscordAnalyzeDto, AnalyzePeriod } from './dto/discord-analyse.dto';
import { DiscordMessageService } from 'src/discord/services/discord-message.service';
import { AnalysisHelper } from './analysis.helper';
import { AnalysisService } from './analysis.service';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class AnalysisProvider {
  private readonly logger = new Logger(AnalysisProvider.name);
  constructor(
    private readonly discordMessageService: DiscordMessageService,
    private readonly analysisHelper: AnalysisHelper,
    private readonly analysisService: AnalysisService,
  ) {}

  async analyzeDiscord(dto: DiscordAnalyzeDto): Promise<any> {
    const now = new Date();
    const since = this.getSinceDate(dto.period, now);
    const messages = await this.discordMessageService.findMessagesInRange(
      dto.channelId,
      since,
      now,
    );
    if (!messages.length) {
      throw new HttpException('No messages found for this period.', HttpStatus.NO_CONTENT);
    }
    const formatted = this.formatMessages(messages);
    return this.handleLlmCall(dto, formatted, since, now);
  }

  async findByScope(findAnalysis: any): Promise<any> {
    this.logger.verbose(JSON.stringify(findAnalysis));
    if (findAnalysis.platform === 'discord') {
      if (!findAnalysis.scope.channelId) {
        return this.analysisService.findByDiscordServer(findAnalysis.scope.serverId, findAnalysis.promptKey);
      }
      return this.analysisService.findByDiscordScope(findAnalysis.scope.serverId, findAnalysis.scope.channelId, findAnalysis.promptKey);
    }
    // Ajouter d'autres plateformes ici si besoin
    return [];
  }

  async trendToContent(analyseId: string, trendIndex = 0): Promise<any> {
    let analysis;
    try {
      analysis = await this.analysisService.findById(analyseId);
    } catch {
      throw new BadRequestException('Invalid analyse_id format');
    }
    if (!analysis) {
      throw new NotFoundException('Analyse not found');
    }
    let parsedResult: any;
    try {
      const raw = analysis.result?.choices?.[0]?.message?.content;
      parsedResult = JSON.parse(raw);
    } catch {
      throw new InternalServerErrorException('Failed to parse LLM analysis content');
    }
    const trends = parsedResult?.trends || [];
    if (!trends.length) {
      throw new BadRequestException('No trends found in the analysis result');
    }
    if (trendIndex >= trends.length) {
      throw new BadRequestException(`Trend index ${trendIndex} out of range. Only ${trends.length} trend(s) available.`);
    }
    const selectedTrend = trends[trendIndex];
    const trendInput = {
      trend_title: selectedTrend?.title,
      summary: selectedTrend?.summary,
      representative_messages: selectedTrend?.representative_messages || [],
      activity_level: selectedTrend?.activity_level,
      timeframe: analysis.result?.timeframe,
    };
    const modelName = analysis.llm_model;
    try {
      const response = await this.analysisHelper.trendToContent({
        modelName,
        promptKey: 'trend_to_content',
        trend: trendInput,
      });
      // Retourner toutes les infos nécessaires au controller pour le stockage
      return { response, analysis, trendInput, trendIndex, selectedTrend };
    } catch (e) {
      throw new InternalServerErrorException(`LLM error: ${e}`);
    }
  }

  private getSinceDate(period: AnalyzePeriod, now: Date): Date {
    switch (period) {
      case AnalyzePeriod.LAST_DAY:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case AnalyzePeriod.LAST_WEEK:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case AnalyzePeriod.LAST_MONTH:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
    }
  }

  private formatMessages(messages: any[]): string[] {
    return messages
      .sort(
        (a, b) =>
          new Date(a.created_at_by_discord).getTime() -
          new Date(b.created_at_by_discord).getTime(),
      )
      .map((msg) => {
        const dt = new Date(msg.created_at_by_discord).toISOString().slice(0, 16).replace('T', ' ');
        const user = msg.author_name || msg.user_id?.toString() || '?';
        return `[${dt}] ${user}: ${msg.content}`;
      });
  }

  private async handleLlmCall(dto: DiscordAnalyzeDto, formatted: string[], since: Date, now: Date): Promise<any> {
    try {
      const ovhResponse = await this.analysisHelper.analyse({
        modelName: dto.model_name,
        promptKey: dto.prompt_key,
        userContent: formatted,
      });
      const newAnalysis = await this.analysisHelper.saveAnalysis({
        creator_id: dto.creator_id,
        platform: 'discord',
        prompt_key: dto.prompt_key,
        llm_model: dto.model_name,
        scope: {
          server_id: dto.serverId,
          channel_id: dto.channelId,
        },
        period: {
          from: since,
          to: now,
        },
        result: ovhResponse,
      });
      return newAnalysis;
    } catch (e) {
      throw new HttpException(`LLM error: ${e}`, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
} 