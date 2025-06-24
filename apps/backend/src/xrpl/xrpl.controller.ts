import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { XrplService } from './xrpl.service';
import { CreateXrplDto } from './dto/create-xrpl.dto';
import { UpdateXrplDto } from './dto/update-xrpl.dto';
import { Public } from 'src/auth/auth.decorator';


@Controller('xrpl')
export class XrplController {
  constructor(private readonly xrplService: XrplService) {}

  @Post()
  create(@Body() createXrplDto: CreateXrplDto) {
    return this.xrplService.create(createXrplDto);
  }

  @Public()
  @Get()
  findAll() {
    return this.xrplService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.xrplService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateXrplDto: UpdateXrplDto) {
    return this.xrplService.update(+id, updateXrplDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.xrplService.remove(+id);
  }
}
