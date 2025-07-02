import { Injectable, Logger } from '@nestjs/common';
import { DiscordService } from 'src/discord/services/discord.service';
import { UserService } from 'src/user/user.service';
import { DiscordClientService } from '../services/discord-client.service';
import { CommunityService } from 'src/community/community.service';
import { LearnerService } from 'src/learner/learner.service';
import { Gender } from 'src/shared/enums/Gender';
import { XrplProvider } from 'src/xrpl/xrpl.provider';
import type { User } from 'src/user/entities/user.entity';

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

	private async getOrCreateUserFromDiscordOAuth(
		code: string,
		redirectUri: string,
	) {
		console.log('code', code);
		console.log('redirectUri', redirectUri);
		const response = await fetch('https://discord.com/api/oauth2/token', {
			method: 'POST',
			body: new URLSearchParams({
				client_id: process.env.DISCORD_CLIENT_ID,
				client_secret: process.env.DISCORD_CLIENT_SECRET,
				code,
				grant_type: 'authorization_code',
				redirect_uri: redirectUri,
				scope: 'identify email',
			}).toString(),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
		});
		console.log('redirectUri', redirectUri);
		const data = await response.json();
		if (!data.access_token) {
			throw new Error(
				'OAuth Discord: access_token manquant. Réponse: ' +
					JSON.stringify(data),
			);
		}
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
		const global_name = discordUser.global_name;

		let user = await this.userService.findOneByEmail(email);

		if (!user) {
			user = await this.userService.create({
				email: email,
				firstname: global_name,
				lastname: '',
				pseudo: username,
				password: '',
				gender: Gender.Male,
				age: new Date(),
			});
		}

		await this.userService.update(user.id, {
			discordAccess: discordAccess,
			discordId: discordUser.id,
			discordAvatar: discordUser.avatar,
		});

		return { user, discordUser };
	}

	// Flow depuis Discord/guild (avec ajout à la communauté)
	async handleDiscordLink(code: string, guildId: string) {
		const redirectUri = `${process.env.BACK_URL}/discord-bot/link`;
		const { user, discordUser } =
			await this.getOrCreateUserFromDiscordOAuth(code, redirectUri);

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
			await this.learnerService.create(user.id, community.id);
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

		return await this.userService.findOneById(user.id);
	}

	// Nouveau flow pour login/signup via Discord (pas de notion de guild/community)
	async handleDiscordAuth(code: string) {
		const redirectUri = `${process.env.BACK_URL}/auth/discord/callback`;
		const { user } = await this.getOrCreateUserFromDiscordOAuth(
			code,
			redirectUri,
		);
		return user;
	}

	async handleMintNFT(user: User) {
		const updatedUser = await this.userService.findOneById(user.id);
		return await this.xrplProvider.generateAccountAndMintNft(updatedUser);
	}
}
