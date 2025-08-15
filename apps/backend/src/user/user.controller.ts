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
import { FindContributorDto } from './dto/find-contributor.dto';
import { LearnerService } from 'src/learner/learner.service';
@ApiTags('User')
@Controller('user')
export class UserController {
	private readonly logger = new Logger(UserController.name);

	constructor(
		private readonly userService: UserService,
		private readonly learnerService: LearnerService,
	) {}

	@Public()
	@Get('all')
	async findAllUsers(@Query('search') search?: string) {
		return this.userService.findAll(search);
	}

	@Get()
	async findOne(@User() user: UserEntity) {
		return { user };
	}

	@Put()
	async updateOneUser(@User() user: UserEntity, @Body() dto: UpdateUserDto) {
		await this.userService.update(user.id, dto);
		const updated = await this.userService.findOneById(user.id);
		return { user: updated };
	}

	@Public()
	@Get(':id/nft-metadata')
	async getNftMetadata(@Param('id') id: string) {
		const user = await this.userService.findOneById(+id);
		console.log(user);
		if (!user && !user.nftId && !user.discordId) {
			throw new NotFoundException(
				'User and NFT ID and Discord profile not found',
			);
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

		let image = '';
		if (user.discordId) {
			image = `https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`;
		} else {
			image = `https://ui-avatars.com/api/?name=${encodeURIComponent(
				user.firstname + ' ' + user.lastname,
			)}&rounded=true&background=random`;
		}

		return {
			name: `Snowledge Profile: ${user.firstname}`,
			description: `This NFT represents the user ${user.firstname} on the Snowledge platform.`,
			image: image,
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
	async addExpertise(
		@Param('idUser') idUser: number,
		@Body() add: AddExpertiseUserDto,
	) {
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

	@Public()
	@Post('find-contributor')
	async findContributor(
		@User() user: UserEntity,
		@Body() infoExpertise: FindContributorDto,
	) {
		const contributors =
			await this.learnerService.findContributorsByExpertiseInUserCommunity(
				infoExpertise.communityId,
				infoExpertise.expertises,
			);
		console.log(contributors);

		return infoExpertise.expertises.map((exp) => ({
			expertise: exp,
			contributors: contributors.filter((u) => u.expertise === exp),
		}));
	}
}
