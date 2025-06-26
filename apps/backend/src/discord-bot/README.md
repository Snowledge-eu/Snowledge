# Discord Bot - Architecture des Commandes

## 📋 Vue d'ensemble

Ce système suit les **bonnes pratiques Discord** pour l'enregistrement et la gestion des commandes slash. L'architecture est modulaire et évite les problèmes de duplication.

## 🏗️ Architecture

### Structure des fichiers

```
src/discord-bot/
├── commands/                    # Fichiers de commandes individuelles
│   └── mynft.command.ts
├── services/
│   ├── discord-client.service.ts      # Client Discord principal
│   └── discord-command.service.ts     # Gestionnaire de commandes
├── scripts/
│   └── register-commands.ts           # Script d'enregistrement
└── discord-shared.module.ts          # Module partagé
```

### Modules

- **`DiscordSharedModule`** : Contient les services partagés (client, commandes)
- **`DiscordBotModule`** : Module principal avec les interactions
- **`DiscordLogicModule`** : Logique métier Discord

## ⚡ Utilisation

### 1. Enregistrement des commandes

#### Global (tous les serveurs)

```bash
npm run discord:register-commands
```

_Les commandes prennent ~1h pour se propager sur tous les serveurs_

#### Spécifique à un serveur (développement)

```bash
npm run discord:register-commands:guild <GUILD_ID>
```

_Disponible immédiatement sur le serveur spécifié_

### 2. Ajouter une nouvelle commande

1. **Créer le fichier de commande** dans `commands/`

```typescript
// commands/example.command.ts
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ExampleCommand {
	private readonly logger = new Logger(ExampleCommand.name);

	get data() {
		return new SlashCommandBuilder()
			.setName('example')
			.setDescription("Commande d'exemple");
	}

	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: 'Hello World!', ephemeral: true });
	}
}
```

2. **Ajouter au service de commandes**

```typescript
// services/discord-command.service.ts
constructor(
	private readonly myNftCommand: MyNftCommand,
	private readonly exampleCommand: ExampleCommand, // ← Ajouter ici
) {
	this.loadCommands();
}

private loadCommands() {
	const commands = [
		this.myNftCommand,
		this.exampleCommand, // ← Et ici
	];
	// ...
}
```

3. **Enregistrer dans le module**

```typescript
// discord-shared.module.ts
@Module({
	imports: [UserModule],
	providers: [
		DiscordClientService,
		DiscordCommandService,
		MyNftCommand,
		ExampleCommand, // ← Ajouter ici
	],
	exports: [DiscordClientService, DiscordCommandService],
})
```

4. **Mettre à jour le script d'enregistrement**

```typescript
// scripts/register-commands.ts
const exampleCommand = new ExampleCommand(); // Ajouter
const commands = [myNftCommand, exampleCommand].map((command) =>
	command.data.toJSON(),
);
```

5. **Réenregistrer les commandes**

```bash
npm run discord:register-commands
```

## 🔧 Bonnes pratiques

### ✅ À faire

- Utiliser le script séparé pour l'enregistrement
- Tester avec `guild` avant le déploiement global
- Créer des commandes modulaires dans `commands/`
- Gérer les erreurs dans chaque commande
- Utiliser `ephemeral: true` pour les réponses privées

### ❌ À éviter

- Enregistrer les commandes à chaque démarrage du bot
- Mélanger logique de commande et logique d'enregistrement
- Dupliquer le code des commandes
- Enregistrer globalement pour le développement

## 🐛 Dépannage

### Commande non visible

1. Vérifier l'enregistrement : `npm run discord:register-commands`
2. Attendre la propagation (~1h pour global)
3. Redémarrer Discord pour forcer la synchronisation

### Erreur d'exécution

- Vérifier les logs du `DiscordCommandService`
- S'assurer que toutes les dépendances sont injectées
- Vérifier les permissions du bot

### Commande dupliquée

- Une seule instance de `DiscordClientService` existe
- Utiliser `DiscordSharedModule` pour partager les services

## 📝 Logs utiles

```
✅ Connected as SnowledgeDevAlex#5589    # Bot connecté
Loaded 1 commands                        # Commandes chargées
Commande reçue: mynft                    # Commande exécutée
```

## 🔗 Références

- [Guide officiel Discord.js](https://discordjs.guide/creating-your-bot/slash-commands.html)
- [Documentation Discord API](https://discord.com/developers/docs/interactions/application-commands)
