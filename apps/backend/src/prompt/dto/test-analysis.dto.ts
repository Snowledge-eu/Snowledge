import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class TestAnalysisDto {
	@IsString()
	@IsNotEmpty()
	prompt_name: string;

	@IsString()
	@IsNotEmpty()
	community_id: string;

	@IsString()
	@IsOptional()
	model_name?: string;

	@IsNumber()
	@IsOptional()
	@Type(() => Number)
	max_tokens?: number;
}
