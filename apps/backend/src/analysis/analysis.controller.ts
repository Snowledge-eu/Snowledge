import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, HttpException, HttpStatus, Logger, HttpCode, Header, Res } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';
import { TransformLongToStringInterceptor } from 'src/shared/interceptors/transform-long-to-string.pipe';
import { AnalyzePeriod, DiscordAnalyzeDto } from './dto/discord-analyse.dto';
import { DiscordMessageService } from 'src/discord/services/discord-message.service';
import { AnalysisHelper } from './analysis.helper';
import { Response } from 'express';
@Controller('analysis')
export class AnalysisController {
	private readonly logger = new Logger(AnalysisController.name);

	constructor(
		private readonly analysisService: AnalysisService,
		private readonly discordMessageService: DiscordMessageService,
		private readonly analysisHelper: AnalysisHelper,
	) {}

	// @Post()
	// create(@Body() createAnalysisDto: CreateAnalysisDto) {
	//   return this.analysisService.create(createAnalysisDto);
	// }
	@Post()
	@UseInterceptors(TransformLongToStringInterceptor)
	async findByScope(@Body() findAnalysis: FindAnalysisDto) {
		this.logger.verbose(JSON.stringify(findAnalysis));
		try {      
			const all = await this.analysisService.findAll();
			console.log('all', all)
			if(findAnalysis.platform == 'discord') {

				if(!findAnalysis.scope.channelId){
					const analys = await this.analysisService.findByDiscordServer(findAnalysis.scope.serverId, findAnalysis.promptKey);
					return analys;
				}
				const analysByScope = await this.analysisService.findByDiscordScope(findAnalysis.scope.serverId, findAnalysis.scope.channelId, findAnalysis.promptKey);
				console.log("analysByScope", analysByScope)
				return analysByScope;
			}
		} catch (error) {
		console.error(error);
		}
	}

	@Post('discord')
	async analyzeDiscord(
		@Body() dto: DiscordAnalyzeDto,
		  @Res({ passthrough: true }) res: Response,
	) {
		try {
		this.logger.verbose(JSON.stringify(dto))
			const now = new Date();
			let since: Date;
			
			switch (dto.period) {
				case AnalyzePeriod.LAST_DAY:
					since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
					break;
				case AnalyzePeriod.LAST_WEEK:
					since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
					break;
				case AnalyzePeriod.LAST_MONTH:
					since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
					break;
				default:
					throw new HttpException('Invalid period', HttpStatus.BAD_REQUEST);
			}
			
			const messages = await this.discordMessageService.findMessagesInRange(
				dto.channelId,
				since,
				now,
			);
			
			if (!messages.length) {
				res.set('X-Reason', 'No messages found for this period.');
				res.status(HttpStatus.NO_CONTENT);
				return;
			}
			
			const formatted = messages
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
			
			try {
				const ovhResponse = await this.analysisHelper.analyse({
					modelName: dto.model_name,
					promptKey: dto.prompt_key,
					userContent: formatted,
				});
				console.dir(ovhResponse, { depth: null });
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
				console.log("newAnalysis", newAnalysis)
				return newAnalysis;
			} catch (e) {
				throw new HttpException(`LLM error: ${e}`, HttpStatus.INTERNAL_SERVER_ERROR);
			}
		} catch (error) {
			this.logger.error(error)
		}
	}
	@Get()
	findAll() {
		return this.analysisService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.analysisService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateAnalysisDto: UpdateAnalysisDto) {
		return this.analysisService.update(+id, updateAnalysisDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.analysisService.remove(+id);
	}
}
