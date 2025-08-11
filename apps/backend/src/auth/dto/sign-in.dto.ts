import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SignInDto {
	@ApiProperty({
		type: String,
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	@IsOptional()
	password: string;
}
