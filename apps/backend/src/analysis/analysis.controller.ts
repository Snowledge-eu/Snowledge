import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';
import { TransformLongToStringInterceptor } from 'src/shared/interceptors/transform-long-to-string.pipe';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  // @Post()
  // create(@Body() createAnalysisDto: CreateAnalysisDto) {
  //   return this.analysisService.create(createAnalysisDto);
  // }
  @Post()
  @UseInterceptors(TransformLongToStringInterceptor)
  async findByScope(@Body() findAnalysis: FindAnalysisDto) {

    if(findAnalysis.platform == 'discord') {
      if(!findAnalysis.scope.channelId){
        const analys = await this.analysisService.findByDiscordServer(findAnalysis.scope.serverId, findAnalysis.promptKey);

        return analys;
      }
      const analysByScope = await this.analysisService.findByDiscordScope(findAnalysis.scope.serverId, findAnalysis.scope.channelId, findAnalysis.promptKey);

      return analysByScope;
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
