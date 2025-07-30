# Daemons

Ce dossier contient tous les daemons de l'application backend.

## Structure

```
src/daemon/
├── discord/              # Daemons Discord
│   ├── harvest-daemon.ts # Daemon principal de récupération
│   └── harvest-worker.ts # Worker alternatif
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

### harvest-worker.ts
Worker alternatif qui utilise le `DiscordHarvestJobHelper` pour une approche plus modulaire.

## Utilisation

### En développement
```bash
# Daemon principal
npm run start:harvest

# Worker alternatif
npm run start:worker
```

### En production (Docker)
Le daemon est configuré pour démarrer automatiquement dans le conteneur `discord-harvester`.

## Scripts disponibles

- `start:harvest` : Lance le daemon principal
- `start:worker` : Lance le worker alternatif

## Logs

Les daemons utilisent des préfixes de logs clairs :
- `[Discord Daemon]` pour le daemon principal
- `[Discord Worker]` pour le worker 