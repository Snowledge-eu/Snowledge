import { Module } from '@nestjs/common';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordProposalFormService } from './services/discord-proposal-form.service';
import { DiscordProposalProvider } from './providers/discord-proposal.provider';
import { DiscordLogicModule } from './discord-logic.module';
import { DiscordSharedModule } from './discord-shared.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { UserModule } from 'src/user/user.module';
import { CommunityModule } from 'src/community/community.module';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';

@Module({
	imports: [
		DiscordLogicModule,
		DiscordSharedModule,
		ProposalModule,
		UserModule,
		CommunityModule,
		DiscordServerModule,
	],
	providers: [
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordProposalProvider,
	],
	exports: [
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordProposalProvider,
	],
})
export class DiscordProposalModule {}
