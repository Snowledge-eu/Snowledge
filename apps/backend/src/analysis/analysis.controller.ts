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
import { AnalysisProvider } from './analysis.provider';
@Controller('analysis')
export class AnalysisController {
	private readonly logger = new Logger(AnalysisController.name);

	constructor(
		private readonly analysisService: AnalysisService,
		private readonly discordMessageService: DiscordMessageService,
		private readonly analysisHelper: AnalysisHelper,
		private readonly analysisProvider: AnalysisProvider,
	) {}

	// @Post()
	// create(@Body() createAnalysisDto: CreateAnalysisDto) {
	//   return this.analysisService.create(createAnalysisDto);
	// }
	@Post()
	@UseInterceptors(TransformLongToStringInterceptor)
	async findByScope(@Body() findAnalysis: FindAnalysisDto) {
		return this.analysisProvider.findByScope(findAnalysis);
	}

	@Post('discord')
	async analyzeDiscord(
		@Body() dto: DiscordAnalyzeDto,
		@Res({ passthrough: true }) res: Response,
	) {
		try {
			const result = await this.analysisProvider.analyzeDiscord(dto);
			return result;
		} catch (error) {
			if (error instanceof HttpException) {
				if (error.getStatus() === HttpStatus.NO_CONTENT) {
					res.set('X-Reason', 'No messages found for this period.');
					res.status(HttpStatus.NO_CONTENT);
					return;
				}
				throw error;
			}
			this.logger.error(error);
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
