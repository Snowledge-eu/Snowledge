import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { Community } from '../community/entities/community.entity';
import { User } from '../user/entities/user.entity';
import { DiscordProposalModule } from 'src/discord-bot/discord-proposal.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Proposal, Community, User]),
		DiscordProposalModule,
	],
	providers: [ProposalService],
	controllers: [ProposalController],
	exports: [ProposalService],
})
export class ProposalModule {}
