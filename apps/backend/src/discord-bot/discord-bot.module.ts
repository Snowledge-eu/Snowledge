import { Module } from '@nestjs/common';
import { DiscordBotController } from './discord-bot.controller';
import { DiscordInteractionService } from './services/discord-interaction.service';
import { DiscordLinkProvider } from './providers/discord-link.provider';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { CommunityModule } from 'src/community/community.module';
import { UserModule } from 'src/user/user.module';
import { DiscordLogicModule } from './discord-logic.module';
import { DiscordModule } from 'src/discord/discord.module';
import { LearnerModule } from 'src/learner/learner.module';
import { DiscordProposalProvider } from './providers/discord-proposal.provider';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordProposalFormService } from './services/discord-proposal-form.service';
import { XrplModule } from 'src/xrpl/xrpl.module';
import { DiscordSharedModule } from './discord-shared.module';

@Module({
	imports: [
		DiscordModule,
		ProposalModule,
		CommunityModule,
		UserModule,
		DiscordServerModule,
		DiscordLogicModule,
		LearnerModule,
		XrplModule,
		DiscordSharedModule,
	],
	controllers: [DiscordBotController],
	providers: [
		DiscordInteractionService,
		DiscordLinkProvider,
		DiscordProposalProvider,
		DiscordProposalService,
		DiscordProposalFormService,
	],
	exports: [
		DiscordInteractionService,
		DiscordLinkProvider,
		DiscordProposalProvider,
	],
})
export class DiscordBotModule {}
