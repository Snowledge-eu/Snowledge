import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptController } from './prompt.controller';
import { PromptProvider } from './prompt.provider';
import { PromptService } from './prompt.service';

import { Prompt } from './entities/prompt.entity';
import { UserModule } from '../user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([Prompt]), UserModule],
	controllers: [PromptController],
	providers: [PromptProvider, PromptService],
	exports: [PromptService, PromptProvider],
})
export class PromptModule {}
