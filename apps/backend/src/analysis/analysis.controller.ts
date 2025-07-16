import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, HttpException, HttpStatus, Logger, HttpCode, Header, Res, NotFoundException, BadRequestException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';
import { TransformLongToStringInterceptor } from '../shared/interceptors/transform-long-to-string.pipe';
import { AnalyzePeriod, DiscordAnalyzeDto } from './dto/discord-analyse.dto';
import { DiscordMessageService } from '../discord/services/discord-message.service';
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
	async findOne(@Param('id') id: string) {
		try {
			const analysis = await this.analysisService.findOne(+id);
			if (!analysis) {
				throw new NotFoundException('Analysis not found');
			}
			return analysis;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Invalid analysis ID format');
		}
	}

	@Patch(':id')
	async update(@Param('id') id: string, @Body() updateAnalysisDto: UpdateAnalysisDto) {
		try {
			const updatedAnalysis = await this.analysisService.update(+id, updateAnalysisDto);
			if (!updatedAnalysis) {
				throw new NotFoundException('Analysis not found');
			}
			return updatedAnalysis;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Invalid analysis ID format');
		}
	}

	@Delete(':id')
	async remove(@Param('id') id: string) {
		try {
			const deletedAnalysis = await this.analysisService.remove(+id);
			if (!deletedAnalysis) {
				throw new NotFoundException('Analysis not found');
			}
			return { message: 'Analysis deleted successfully' };
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw error;
			}
			throw new BadRequestException('Invalid analysis ID format');
		}
	}
}
