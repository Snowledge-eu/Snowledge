import {
	Controller,
	Get,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	Query,
	BadRequestException,
	HttpException,
	HttpStatus,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';
import { User } from '../../user/decorator';
import { User as UserEntity } from '../../user/entities/user.entity';
import { AnalysisProvider } from '../../analysis/analysis.provider';

@Controller('summary')
export class SummaryController {
	constructor(
		private readonly summaryService: SummaryService,
		private readonly analysisProvider: AnalysisProvider,
	) {}

	@Get('trend-to-content/:analyseId')
	async trendToContent(
		@Param('analyseId') analyseId: string,
		@Query('trend_index') trendIndex = 0,
	) {
		const {
			response,
			analysis,
			trendInput,
			trendIndex: idx,
			selectedTrend,
		} = await this.analysisProvider.trendToContent(analyseId, trendIndex);
		await this.summaryService.create({
			creator_id: analysis.creator_id || -1,
			platform: 'discord',
			source_analysis_id: analysis._id,
			prompt_key: 'trend_to_content',
			llm_model: analysis.llm_model,
			scope: {
				trend_id: idx,
				trend_title: selectedTrend?.title,
				timeframe: trendInput.timeframe,
			},
			input_trend: trendInput,
			result: response,
			created_at: new Date(),
		});
		return response;
	}
	@Post()
	create(@Body() createSummaryDto: CreateSummaryDto) {
		return this.summaryService.create(createSummaryDto);
	}

	@Get()
	findAll() {
		return this.summaryService.findAll();
	}

	@Get(':analyseId')
	async findOne(
		@Param('analyseId') analyseId: string,
		@Query('trendId') trendId: number,
		@User() user: UserEntity,
	) {
		return this.summaryService.findOneByAnalysisIdAndTrendId(
			analyseId,
			trendId,
		);
	}

	@Patch(':id')
	update(
		@Param('id') id: string,
		@Body() updateSummaryDto: UpdateSummaryDto,
	) {
		return this.summaryService.update(+id, updateSummaryDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.summaryService.remove(+id);
	}
}
