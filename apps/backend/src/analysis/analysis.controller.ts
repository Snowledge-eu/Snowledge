import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	UseInterceptors,
	UseGuards,
	HttpException,
	HttpStatus,
	Logger,
	Res,
	Request,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';
import { TransformLongToStringInterceptor } from '../shared/interceptors/transform-long-to-string.pipe';
import { DiscordAnalyzeDto } from './dto/discord-analyse.dto';
import { Response } from 'express';
import { AnalysisProvider } from './analysis.provider';
import { PromptProvider } from '../prompt/prompt.provider';
import { TestAnalysisDto } from './dto/test-analysis.dto';
import { User } from '../user/entities/user.entity';
import { OptionalAuthGuard } from '../auth/optional-auth.guard';
@Controller('analysis')
export class AnalysisController {
	private readonly logger = new Logger(AnalysisController.name);

	constructor(
		private readonly analysisService: AnalysisService,
		private readonly analysisProvider: AnalysisProvider,
		private readonly promptProvider: PromptProvider,
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
			this.logger.error('Error in analyzeDiscord:', error);

			if (error instanceof HttpException) {
				if (error.getStatus() === HttpStatus.NO_CONTENT) {
					res.set('X-Reason', 'No messages found for this period.');
					res.status(HttpStatus.NO_CONTENT);
					return;
				}
				throw error;
			}

			// Pour les autres erreurs, retourner une réponse d'erreur appropriée
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Internal server error';
			throw new HttpException(
				errorMessage,
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}
	@Get()
	findAll() {
		return this.analysisService.findAll();
	}

	@Get('prompts')
	@UseGuards(OptionalAuthGuard)
	async getAvailablePrompts(@Request() req: any) {
		try {
			const user = req.user as User;
			
			// Si l'utilisateur est connecté, récupérer ses prompts + les publics
			// Sinon, seulement les prompts publics
			const prompts = user 
				? await this.promptProvider.getUserPrompts(user)
				: await this.promptProvider.getPublicPrompts();
				
			return prompts.map((prompt) => ({
				name: prompt.name,
				description: prompt.description,
				platform: prompt.platform,
				temperature: prompt.temperature,
				top_p: prompt.top_p,
			}));
		} catch (error) {
			this.logger.error('Error fetching prompts:', error);
			throw new HttpException(
				'Failed to fetch available prompts',
				HttpStatus.INTERNAL_SERVER_ERROR,
			);
		}
	}

	@Post('test-analysis')
	async testAnalysis(
		@Body() testAnalysisDto: TestAnalysisDto,
		@Request() req: any,
	) {
		const user = req.user as User;
		return this.analysisProvider.testAnalysis(testAnalysisDto, user);
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
	async update(
		@Param('id') id: string,
		@Body() updateAnalysisDto: UpdateAnalysisDto,
	) {
		try {
			const updatedAnalysis = await this.analysisService.update(
				+id,
				updateAnalysisDto,
			);
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
