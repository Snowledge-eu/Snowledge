import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class ForgotPassword {
	@ApiProperty({
		type: String,
	})
	@IsEmail()
	email: string;
}
