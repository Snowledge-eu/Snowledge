import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { Proposal } from '../proposal/entities/proposal.entity';
import { User } from '../user/entities/user.entity';
import { Community } from 'src/community/entities/community.entity';
import { ProposalService } from 'src/proposal/proposal.service';
import { DiscordBotModule } from 'src/discord-bot/discord-bot.module';
import { ProposalModule } from 'src/proposal/proposal.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Vote, Proposal, User, Community]),
		ProposalModule,
		UserModule,
	],
	providers: [VoteService],
	controllers: [VoteController],
	exports: [VoteService],
})
export class VoteModule {}
