import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const commands = [
	new SlashCommandBuilder()
		.setName('mynft')
		.setDescription("Affiche votre NFT d'identité Snowledge."),
].map((command) => command.toJSON());

const rest = new REST({ version: '10' }).setToken(
	process.env.DISCORD_BOT_TOKEN,
);

(async () => {
	try {
		console.log('Started refreshing application (/) commands globally.');

		// Enregistrement global (disponible sur tous les serveurs)
		// Prend ~1h à se propager mais fonctionne partout
		await rest.put(
			Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
			{
				body: commands,
			},
		);

		console.log('Successfully reloaded application (/) commands globally.');
	} catch (error) {
		console.error(error);
	}
})();
