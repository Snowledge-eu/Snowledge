import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException, HttpException, HttpStatus, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';
import { User } from 'src/user/decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { AnalysisHelper } from 'src/analysis/analysis.helper';
import { AnalysisService } from 'src/analysis/analysis.service';

@Controller('summary')
export class SummaryController {
	constructor(
		private readonly analysisService: AnalysisService,
		private readonly analysisHelper: AnalysisHelper,
		private readonly summaryService: SummaryService
	) {}

  @Get('trend-to-content/:analyseId')
	async trendToContent(
	@Param('analyseId') analyseId: string,
	@Query('trend_index') trendIndex = 0,
	) {
		let analysis;
	try {
		analysis = await this.analysisService.findById(analyseId);
	} catch {
		throw new HttpException('Invalid analyse_id format', HttpStatus.BAD_REQUEST);
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

		// Stocker dans summary_results
		await this.summaryService.create({
			creator_id: analysis.creator_id || -1,
			platform: 'discord',
			source_analysis_id: analysis._id,
			prompt_key: 'trend_to_content',
			llm_model: modelName,
			scope: {
				trend_id: trendIndex,
				trend_title: selectedTrend?.title,
				timeframe: trendInput.timeframe,
			},
			input_trend: trendInput,
			result: response,
			created_at: new Date(),
		});

		return response;
	} catch (e) {
		throw new InternalServerErrorException(`LLM error: ${e}`);
	}
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
  async findOne(@Param('analyseId') analyseId: string, @Query('trendId') trendId: number, @User() user: UserEntity) {
    console.log(user);
    const all = await this.summaryService.findAll()
    console.log(all);
    console.log("--->", analyseId, trendId)
    const summaryData = await this.summaryService.findOneByAnalysisIdAndTrendId(analyseId, trendId);
    return summaryData;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSummaryDto: UpdateSummaryDto) {
    return this.summaryService.update(+id, updateSummaryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.summaryService.remove(+id);
  }
}
