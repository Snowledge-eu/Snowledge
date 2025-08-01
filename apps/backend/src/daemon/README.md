# Daemons

Ce dossier contient tous le daemon de l'application.

## Structure

```
src/daemon/
├── discord/              # Daemons Discord
│   ├── harvest-daemon.ts # Daemon principal de récupération
└── README.md            # Ce fichier
```

## Discord Daemons

### harvest-daemon.ts
Daemon principal pour la récupération des messages Discord. Il :
- Se connecte au client Discord
- Récupère les jobs en attente
- Traite les messages des canaux spécifiés
- Sauvegarde les nouveaux messages
- Met à jour le statut des jobs

## Utilisation

### En Local (sans Docker)
```bash
# Daemon principal
npm run start:harvest
```

### En Local et sur Serveur (sur Docker)
Le daemon est configuré pour démarrer automatiquement dans le conteneur `discord-harvester`.

## Scripts disponibles

- `start:harvest` : Lance le daemon principal

## Logs

Le daemon utilisent un préfixe de logs clairs :
- `[Discord Daemon]` pour le daemon principal