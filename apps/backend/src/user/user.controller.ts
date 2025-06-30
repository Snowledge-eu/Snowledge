import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Logger,
	Query,
	NotFoundException,
	Put,
} from '@nestjs/common';
import { AddExpertiseUserDto, UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from './decorator';
import { User as UserEntity } from './entities/user.entity';
import { UserService } from './user.service';
import { Public } from '../auth/auth.decorator';
import { User as UserDecorator } from './decorator';
@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	constructor(private readonly userService: UserService) {}

	@Public()
	@Get('all')
	async findAllUsers(@Query('search') search?: string) {
		return this.userService.findAll(search);
	}

	@Get()
	async findOne(@User() user: UserEntity) {
		return { user };
	}

	@Public()
	@Get(':id/nft-metadata')
	async getNftMetadata(@Param('id') id: string) {
		const user = await this.userService.findOneById(+id);
		if (!user || !user.discordId) {
			throw new NotFoundException('User or Discord profile not found');
		}

		const nbProposals = user.proposals?.length || 0;
		const proposalVotes = (user.proposals || []).reduce(
			(acc, proposal) => {
				const forVotes = (proposal.votes || []).filter(
					(vote) => vote.choice === 'for',
				).length;
				const againstVotes = (proposal.votes || []).filter(
					(vote) => vote.choice === 'against',
				).length;
				return {
					for: acc.for + forVotes,
					against: acc.against + againstVotes,
					total: acc.total + forVotes + againstVotes,
				};
			},
			{ for: 0, against: 0, total: 0 },
		);

		return {
			name: `Snowledge Profile: ${user.firstname}`,
			description: `This NFT represents the user ${user.firstname} on the Snowledge platform.`,
			image: `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`,
			attributes: [
				{
					trait_type: 'Snowledge User ID',
					value: user.id,
				},
				{
					trait_type: 'Username',
					value: user.firstname,
				},
				{
					trait_type: 'Total Proposals',
					value: nbProposals,
				},
				{
					trait_type: 'For Votes Received',
					value: proposalVotes.for,
				},
				{
					trait_type: 'Against Votes Received',
					value: proposalVotes.against,
				},
				{
					trait_type: 'Total Votes Received',
					value: proposalVotes.total,
				},
			],
		};
	}

	@Put('add-expertise/:idUser')
	async addExpertise(@Param('idUser') idUser: number, @Body() add: AddExpertiseUserDto) {
		return this.userService.setExpertise(idUser, add.expertise);
	}
	@Delete('/by-email/:email')
	byEmail(@Param('email') email: string) {
		return this.userService.deleteByEmail(email);
	}

	@Get('my-invitations')
	async getMyInvitations(@User() user: UserEntity) {
		return this.userService.getInvitationsForUser(user.id);
	}
}
