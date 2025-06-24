import { Module } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { ProposalController } from './proposal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalProvider } from './proposal.provider';
import { CommunityModule } from 'src/community/community.module';
import { UserModule } from 'src/user/user.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Proposal]),
		CommunityModule,
		UserModule,
	],
	controllers: [ProposalController],
	providers: [ProposalService, ProposalProvider],
	exports: [ProposalService, ProposalProvider],
})
export class ProposalModule {}
