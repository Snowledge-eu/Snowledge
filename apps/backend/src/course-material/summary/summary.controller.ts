import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post()
  create(@Body() createSummaryDto: CreateSummaryDto) {
    return this.summaryService.create(createSummaryDto);
  }

  @Get()
  findAll() {
    return this.summaryService.findAll();
  }

  @Get(':analyseId')
  async findOne(@Param('analyseId') analyseId: string, @Query('trendId') trendId: number) {
    const all = await this.summaryService.findAll()
    console.log(all);
    console.log("--->", analyseId, trendId)
    const summaryData = await this.summaryService.findOneByAnalysisIdAndTrendId(analyseId, trendId);
    console.log(summaryData);
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
