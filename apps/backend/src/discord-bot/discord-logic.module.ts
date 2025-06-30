import { Module } from '@nestjs/common';
import { DiscordLogicProvider } from './providers/discord-logic.provider';
import { CommunityModule } from 'src/community/community.module';
import { VoteModule } from 'src/vote/vote.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';
import { DiscordSharedModule } from './discord-shared.module';

@Module({
	imports: [
		CommunityModule,
		VoteModule,
		ProposalModule,
		DiscordServerModule,
		DiscordSharedModule,
	],
	providers: [DiscordLogicProvider],
	exports: [DiscordLogicProvider],
})
export class DiscordLogicModule {}
