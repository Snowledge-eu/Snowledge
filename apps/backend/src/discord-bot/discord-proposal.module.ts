import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscordServer } from 'src/discord-server/entities/discord-server-entity';
import { Proposal } from 'src/proposal/entities/proposal.entity';
import { User as UserEntity } from 'src/user/entities/user.entity';
import { DiscordProposalService } from './services/discord-proposal.service';
import { DiscordProposalFormService } from './services/discord-proposal-form.service';
import { DiscordClientService } from './services/discord-client.service';

@Module({
	imports: [TypeOrmModule.forFeature([DiscordServer, Proposal, UserEntity])],
	providers: [
		DiscordProposalService,
		DiscordProposalFormService,
		DiscordClientService,
	],
	exports: [DiscordProposalService, DiscordProposalFormService],
})
export class DiscordProposalModule {}
