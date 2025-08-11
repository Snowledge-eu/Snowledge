import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ChangePassword {
	@ApiProperty({
		type: String,
	})
	@IsString()
	password: string;

	@ApiProperty({
		type: String,
	})
	@IsString()
	token?: string;
}
