import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailHelper {
	private readonly logger = new Logger(EmailHelper.name);
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

	async tokenEmail(email: string, code: string) {
		try {
			const subject = `Code d'identification`;
	
			const mailSend = await this.mailerService.sendMail({
				to: email,
				subject,
				text: `Veuillez cliquer sur le lien suivant pour valider votre adresse mail : ${process.env.FRONT_URL}/profile?token=${code}`,
			});

			console.log(mailSend);
		} catch (error) {
			this.logger.error(error);
		}

	}

	async forgotPassword(email: string, code: string) {
		try {
			const subject = `Mot de passe oublié`;
	
			const mailSend = await this.mailerService.sendMail({
				to: email,
				subject,
				text: `
					Veuillez cliquer sur le lien puis suivez les instructions sur la page dédier : ${process.env.FRONT_URL}/forgot-password?token=${code}

					Si vous n'êtes pas à l'initiative de cette demande, contactez le support de Snowledge.
				`,
			});

			console.log(mailSend);
		} catch (error) {
			this.logger.error(error);
		}
	}
}
