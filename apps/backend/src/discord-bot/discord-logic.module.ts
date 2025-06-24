import { Module } from '@nestjs/common';
import { DiscordLogicProvider } from './providers/discord-logic.provider';
import { CommunityModule } from 'src/community/community.module';
import { VoteModule } from 'src/vote/vote.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';
import { DiscordClientService } from './services/discord-client.service';

@Module({
	imports: [CommunityModule, VoteModule, ProposalModule, DiscordServerModule],
	providers: [DiscordLogicProvider, DiscordClientService],
	exports: [DiscordLogicProvider],
})
export class DiscordLogicModule {}
