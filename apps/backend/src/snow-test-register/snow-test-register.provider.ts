import { Injectable } from '@nestjs/common';
import { UpdateSnowTestRegisterDto } from './dto/update-snow-test-register.dto';
import { SnowTestRegister } from './entities/snow-test-register.entity';
import { EmailHelper } from '../email/email.helper';

@Injectable()
export class SnowTestRegisterProvider {
  constructor(
    private readonly emailHelper: EmailHelper,
  ) {}

  async sendMailRegister(snowTestRegister: SnowTestRegister) {

    // Send confirmation email to submitter
    try {
      await this.emailHelper.sendGenericEmail(
        snowTestRegister.email,
        'Merci pour votre demande de POC',
        `Bonjour ${snowTestRegister.firstname},\n\nNous avons bien reçu votre demande de POC. Notre équipe vous recontactera rapidement.\n\n— L'équipe Snowledge`,
      );
    } catch {}

    // Send notification email to internal team
    try {
      const info = snowTestRegister;
      await this.emailHelper.sendGenericEmail(
        process.env.SUPPORT_EMAIL || 'tech@snowledge.eu',
        'Nouveau formulaire POC reçu',
        `Nouveau POC:\n- Nom: ${info.firstname} ${info.lastname}\n- Email: ${info.email}\n- Expertise: ${info.expertise}\n- Community size: ${info.communitySize}\n- Platforms: ${info.platforms?.join(', ') || '-'}\n- Referrer: ${info.referrer || '-'}\n`,
      );
    } catch {}

  }
}
