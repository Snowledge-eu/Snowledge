import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { VoteProvider } from './vote.provider';
import { CreateVoteDto } from './dto/create-vote.dto';
import { User } from '../user/decorator';
import { User as UserEntity } from '../user/entities/user.entity';

@Controller('/communities/:communitySlug/votes')
export class VoteController {
	constructor(private readonly voteProvider: VoteProvider) {}

	@Post(':proposalId')
	create(
		@Param('proposalId') proposalId: number,
		@Body() createVoteDto: CreateVoteDto,
		@User() user: UserEntity,
	) {
		return this.voteProvider.create(proposalId, createVoteDto, user.id);
	}

	@Get()
	findAllByUserId(
		@Param('communitySlug') communitySlug: string,
		@User() user: UserEntity,
	) {
		return this.voteProvider.findAllByUserId(communitySlug, user.id);
	}
}
