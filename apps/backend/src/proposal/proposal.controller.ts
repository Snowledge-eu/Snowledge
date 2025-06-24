import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProposalProvider } from './proposal.provider';
import { CreateProposalDto } from './dto/create-proposal.dto/create-proposal.dto';
import { Proposal } from './entities/proposal.entity';

@Controller('communities/:communitySlug/proposals')
export class ProposalController {
	constructor(private readonly proposalProvider: ProposalProvider) {}

	// GET /proposals
	@Get()
	findAll(
		@Param('communitySlug') communitySlug: string,
	): Promise<Proposal[]> {
		return this.proposalProvider.findAllForACommunityBySlug(communitySlug);
	}

	// POST /proposals
	@Post()
	create(
		@Param('communitySlug') communitySlug: string,
		@Body() createProposalDto: CreateProposalDto,
	): Promise<Proposal> {
		return this.proposalProvider.create(createProposalDto, communitySlug);
	}
}
