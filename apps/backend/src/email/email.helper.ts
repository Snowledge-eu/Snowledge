import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailHelper {
	constructor(private readonly mailerService: MailerService) {}

	async codeEmail(email: string, code: number) {
		// const { email, name } = data;

		const subject = `Code d'identification`;

		await this.mailerService.sendMail({
			to: email,
			subject,
			text: `Voici le code à fournir pour finaliser ton identification : ${code}`,
		});
	}
}
