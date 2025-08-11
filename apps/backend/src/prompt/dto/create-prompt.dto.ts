import {
	IsString,
	IsNumber,
	IsArray,
	IsBoolean,
	IsOptional,
	Min,
	Max,
	IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromptDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	description: string;

	@IsString()
	@IsNotEmpty()
	platform: string;

	@IsNumber()
	@Min(0)
	@Max(2)
	@Type(() => Number)
	temperature: number;

	@IsNumber()
	@Min(0)
	@Max(1)
	@Type(() => Number)
	top_p: number;

	@IsArray()
	messages: any[];

	@IsOptional()
	response_format: any;

	@IsBoolean()
	@IsOptional()
	is_public?: boolean;

	@IsString()
	@IsOptional()
	model_name?: string;
}
