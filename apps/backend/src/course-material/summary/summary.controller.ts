import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { CreateSummaryDto } from './dto/create-summary.dto';
import { UpdateSummaryDto } from './dto/update-summary.dto';
import { User } from 'src/user/decorator';
import { User as UserEntity } from 'src/user/entities/user.entity';

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
