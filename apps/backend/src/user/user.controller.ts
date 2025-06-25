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
} from '@nestjs/common';
import { UpdateUserDto } from './dto';
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
					trait_type: 'Discord Username',
					value: user.firstname,
				},
			],
		};
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
