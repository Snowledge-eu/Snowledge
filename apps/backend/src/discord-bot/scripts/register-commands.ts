import { REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import { MyNftCommand } from '../commands/mynft.command';
import { UserService } from 'src/user/user.service';

// Charger les variables d'environnement
dotenv.config({ path: '.env.dev' });

/**
 * Script d'enregistrement des commandes Discord
 *
 * Usage:
 * - npm run discord:register-commands (global)
 * - npm run discord:register-commands guild <guildId> (pour un serveur spécifique)
 */

async function registerCommands() {
	// Configuration
	const token = process.env.DISCORD_BOT_TOKEN;
	const clientId = process.env.DISCORD_CLIENT_ID;

	if (!token || !clientId) {
		console.error(
			'❌ DISCORD_BOT_TOKEN et DISCORD_CLIENT_ID doivent être définis dans .env.dev',
		);
		process.exit(1);
	}

	// Simuler les dépendances pour récupérer les commandes
	// En production, vous pourriez vouloir charger le module NestJS complet
	const userService = null; // Placeholder
	const myNftCommand = new MyNftCommand(userService as any);

	// Collecter toutes les commandes
	const commands = [myNftCommand].map((command) => command.data.toJSON());

	const rest = new REST({ version: '10' }).setToken(token);

	try {
		const args = process.argv.slice(2);
		const isGuildSpecific = args[0] === 'guild';
		const guildId = args[1];

		if (isGuildSpecific) {
			if (!guildId) {
				console.error(
					"❌ ID du serveur requis pour l'enregistrement local",
				);
				console.log(
					'Usage: npm run discord:register-commands guild <guildId>',
				);
				process.exit(1);
			}

			console.log(
				`🔄 Enregistrement des commandes pour le serveur ${guildId}...`,
			);

			const data = (await rest.put(
				Routes.applicationGuildCommands(clientId, guildId),
				{ body: commands },
			)) as any[];

			console.log(
				`✅ ${data.length} commande(s) enregistrée(s) pour le serveur ${guildId}`,
			);
			console.log(
				'📝 Commandes disponibles immédiatement dans ce serveur',
			);
		} else {
			console.log('🔄 Enregistrement global des commandes...');

			const data = (await rest.put(Routes.applicationCommands(clientId), {
				body: commands,
			})) as any[];

			console.log(
				`✅ ${data.length} commande(s) enregistrée(s) globalement`,
			);
			console.log('⏳ Propagation dans ~1h sur tous les serveurs');
		}

		console.log('\n📋 Commandes enregistrées:');
		commands.forEach((cmd) => {
			console.log(`  • /${cmd.name} - ${cmd.description}`);
		});
	} catch (error) {
		console.error("❌ Erreur lors de l'enregistrement:", error);
		process.exit(1);
	}
}

registerCommands();
