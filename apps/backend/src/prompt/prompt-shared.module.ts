import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromptService } from './prompt.service';
import { Prompt } from './entities/prompt.entity';
import { PromptManagerService } from '../analysis/llm/prompt-manager.service';

@Module({
	imports: [TypeOrmModule.forFeature([Prompt])],
	providers: [PromptService, PromptManagerService],
	exports: [PromptService, PromptManagerService],
})
export class PromptSharedModule {}
