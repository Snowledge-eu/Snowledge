import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class FindAnalysisDto {
	@ApiProperty({
		type: String,
	})
	@IsString()
	platform: string;

	scope: Record<string, any>;

	@ApiProperty({
		type: String,
	})
	@IsString()
	promptKey: string;

	@ApiProperty({
		type: Number,
		required: false,
		description: 'Filter by creator ID',
	})
	@IsOptional()
	@IsNumber()
	creator_id?: number;
}
