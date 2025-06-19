import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';
import { UpdateAnalysisDto } from './dto/update-analysis.dto';
import { FindAnalysisDto } from './dto/find-analysis.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  // @Post()
  // create(@Body() createAnalysisDto: CreateAnalysisDto) {
  //   return this.analysisService.create(createAnalysisDto);
  // }
  @Post()
  async findByScope(@Body() findAnalysis: FindAnalysisDto) {
    console.log(findAnalysis)
    const analysis = await this.analysisService.findAll();
    console.log(analysis);
    if(findAnalysis.platform == 'discord') {
      if(!findAnalysis.scope.channelId){
        
        const analys = await this.analysisService.findByDiscordServer(findAnalysis.scope.serverId, findAnalysis.promptKey);
        console.log(analys)
        return analys;
      }
      const analysByScope = await  this.analysisService.findByDiscordScope(findAnalysis.scope.serverId, findAnalysis.scope.channelId, findAnalysis.promptKey);
      console.log(analysByScope)
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
