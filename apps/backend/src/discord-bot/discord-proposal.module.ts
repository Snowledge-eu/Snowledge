import { Module } from '@nestjs/common';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordProposalFormService } from './services/discord-proposal-form.service';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordProposalProvider } from './providers/discord-proposal.provider';
import { DiscordLogicModule } from './discord-logic.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { UserModule } from 'src/user/user.module';
import { CommunityModule } from 'src/community/community.module';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';

@Module({
	imports: [
		DiscordLogicModule,
		ProposalModule,
		UserModule,
		CommunityModule,
		DiscordServerModule,
	],
	providers: [
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordClientService,
		DiscordProposalProvider,
	],
	exports: [
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordProposalProvider,
	],
})
export class DiscordProposalModule {}
