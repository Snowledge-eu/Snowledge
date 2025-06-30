import { IsEmail, IsNotEmpty } from 'class-validator';

export class GenerateAccountAndMintDto {
	@IsEmail()
	@IsNotEmpty()
	email: string;
}
