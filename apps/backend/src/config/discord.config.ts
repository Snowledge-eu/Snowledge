import { registerAs } from '@nestjs/config';
import { DiscordConfig } from './types/discord';

export default registerAs('discordConfig', (): DiscordConfig => {
	console.log('DISCORD_CLIENT_ID', process.env.DISCORD_CLIENT_ID);
	return {
		clientId: process.env.DISCORD_CLIENT_ID || '',
		clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
		redirect: `${process.env.BACK_URL}/discord/link` || '',
	};
});
