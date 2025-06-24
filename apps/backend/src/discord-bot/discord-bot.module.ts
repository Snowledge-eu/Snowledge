import { Module } from '@nestjs/common';
import { DiscordBotController } from './discord-bot.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { Vote } from 'src/vote/entities/vote.entity';
import { DiscordClientService } from './services/discord-client.service';
import { DiscordInteractionService } from './services/discord-interaction.service';
import { DiscordLinkProvider } from './providers/discord-link.provider';
import { DiscordService } from 'src/discord/services/discord.service';
import { UserService } from 'src/user/user.service';
import { DiscordAccess } from 'src/discord/entities/discord-access.entity';
import { Learner } from 'src/learner/entities/learner/learner';
import { CommunityService } from 'src/community/community.service';
import { LearnerService } from 'src/learner/learner.service';
import { DiscordServerModule } from 'src/discord-server/discord-server.module';
import { DiscordProposalModule } from './discord-proposal.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { VoteModule } from 'src/vote/vote.module';
import { CommunityModule } from 'src/community/community.module';
import { UserModule } from 'src/user/user.module';
import { LearnerModule } from 'src/learner/learner.module';
import { DiscordLogicModule } from './discord-logic.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			DiscordServer,
			Proposal,
			UserEntity,
			Community,
			Vote,
			DiscordAccess,
			Learner,
		]),
		DiscordServerModule,
		DiscordProposalModule,
		ProposalModule,
		VoteModule,
		CommunityModule,
		UserModule,
		LearnerModule,
		DiscordLogicModule,
	],
	controllers: [DiscordBotController],
	providers: [
		DiscordClientService,
		DiscordInteractionService,
		DiscordLinkProvider,
		DiscordService,
		UserService,
		CommunityService,
		LearnerService,
	],
	exports: [
		DiscordClientService,
		DiscordInteractionService,
		DiscordProposalModule,
	],
})
export class DiscordBotModule {}
