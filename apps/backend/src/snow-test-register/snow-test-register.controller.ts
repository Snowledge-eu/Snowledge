import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SnowTestRegisterService } from './snow-test-register.service';
import { CreateSnowTestRegisterDto } from './dto/create-snow-test-register.dto';
import { UpdateSnowTestRegisterDto } from './dto/update-snow-test-register.dto';
import { Public } from 'src/auth/auth.decorator';
import { ApiTags } from '@nestjs/swagger';
import { SnowTestRegisterProvider } from './snow-test-register.provider';

@ApiTags('Snow Test Register')
@Controller('snow-test-register')
export class SnowTestRegisterController {
	constructor(
		private readonly snowTestRegisterService: SnowTestRegisterService, 
		private readonly snowTestRegisterProvider: SnowTestRegisterProvider
	) {}

	@Public()
	@Post()
	async create(@Body() createSnowTestRegisterDto: CreateSnowTestRegisterDto) {
		const snowTestRegister = await this.snowTestRegisterService.create(createSnowTestRegisterDto);
		await this.snowTestRegisterProvider.sendMailRegister(snowTestRegister);
		return snowTestRegister;
	}

	@Get()
	findAll() {
		return this.snowTestRegisterService.findAll();
	}

	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.snowTestRegisterService.findOne(+id);
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() updateSnowTestRegisterDto: UpdateSnowTestRegisterDto) {
		return this.snowTestRegisterService.update(+id, updateSnowTestRegisterDto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.snowTestRegisterService.remove(+id);
	}
}
