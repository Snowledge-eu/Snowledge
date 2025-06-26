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
		console.log(
			'Started refreshing application (/) commands for the test guild.',
		);

		// Pour un enregistrement global (prend ~1h à se propager sur tous les serveurs)
		// commenté pour se concentrer sur le dev
		// await rest.put(
		// 	Routes.applicationCommands(process.env.DISCORD_CLIENT_ID),
		// 	{ body: commands },
		// );

		// Pour un enregistrement sur un serveur de test (instantané)
		// Remplacez 'YOUR_GUILD_ID' par l'ID de votre serveur de test
		await rest.put(
			Routes.applicationGuildCommands(
				process.env.DISCORD_CLIENT_ID,
				process.env.DISCORD_GUILD_ID,
			),
			{ body: commands },
		);

		console.log(
			'Successfully reloaded application (/) commands for the guild.',
		);
	} catch (error) {
		console.error(error);
	}
})();
