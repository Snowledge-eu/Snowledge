import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from 'src/discord/services/discord.service';
import { UserService } from 'src/user/user.service';
import { DiscordClientService } from '../services/discord-client.service';
import { CommunityService } from 'src/community/community.service';
import { LearnerService } from 'src/learner/learner.service';
import { Gender } from 'src/shared/enums/Gender';
import { XrplProvider } from 'src/xrpl/xrpl.provider';

@Injectable()
export class DiscordLinkProvider {
	private readonly logger = new Logger(DiscordLinkProvider.name);

	constructor(
		private readonly discordService: DiscordService,
		private readonly userService: UserService,
		private readonly discordClientService: DiscordClientService,
		private readonly communityService: CommunityService,
		private readonly learnerService: LearnerService,
		private readonly xrplProvider: XrplProvider,
	) {}
	async handleDiscordLink(code: string, guildId: string) {
		console.log('code', code);
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: `${process.env.BACK_URL}/discord-bot/link`,
				scope: 'identify email',
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		const data = await response.json();
		const discordAccess = await this.discordService.createDiscordAccess({
			accessToken: data.access_token,
			tokenType: data.token_type,
			expiresIn: data.expires_in,
			refreshToken: data.refresh_token,
			scope: data.scope,
		});

		const userResponse = await fetch('https://discord.com/api/users/@me', {
			headers: {
				Authorization: `Bearer ${data.access_token}`,
			},
		});

		const discordUser = await userResponse.json();
		const email = discordUser.email;
		const username = discordUser.username;
		const discriminator = discordUser.discriminator;

		let user = await this.userService.findOneByEmail(email);

		if (!user) {
			user = await this.userService.create({
				email: email,
				firstname: username,
				lastname: discriminator,
				pseudo: username,
				password: data.access_token,
				gender: Gender.Male,
				age: new Date(),
			});
		}

		//Check s'il est déjà dans la community
		const community =
			await this.communityService.findOneByDiscordServerId(guildId);

		if (!community) {
			console.log('Community not found', guildId);
			throw new Error('Community not found');
		}

		//S'il est learner de la community, on ne fait rien
		const learner = await this.learnerService.findOneByUserIdAndCommunityId(
			user.id,
			community.id,
		);
		if (learner) {
			console.log('user already in community', learner);
			return user;
		}

		// S'il n'est pas le creator de la community, on l'ajoute comme learner et on met à jour le discordAccess et le discordId (puisque le createur l'a déja fait au moment d'jaouter le bot)
		if (user.id !== community.user.id) {
			console.log('user is not creator of community');
			await this.learnerService.create(user.id, community.id);

			await this.userService.update(user.id, {
				discordAccess: discordAccess,
				discordId: discordUser.id,
				discordAvatar: discordUser.avatar,
			});
		}
		// Attribution du rôle Discord
		const client = this.discordClientService?.getClient?.();
		if (!client) throw new Error('Client Discord non initialisé');
		const guild = await client.guilds.fetch(guildId);
		const member = await guild.members.fetch(discordUser.id);
		const role = guild.roles.cache.find(
			(r) => r.name === 'Snowledge Authenticated',
		);
		if (!role) {
			throw new Error(
				"Le rôle 'Snowledge Authenticated' n'existe pas sur ce serveur !",
			);
		}

		await member.roles.add(role.id);

		// Mint NFT
		const updatedUser = await this.userService.findOneById(user.id);
		const nftResult =
			await this.xrplProvider.generateAccountAndMintNft(updatedUser);

		// Save the NFT ID to the user
		if (nftResult.nftId) {
			await this.userService.update(user.id, { nftId: nftResult.nftId });
		}

		return await this.userService.findOneById(user.id);
	}
}
