# Discord Harvest Daemon - Vérification des Termes d'Utilisation

## Vue d'ensemble

Le daemon de collecte Discord a été modifié pour respecter la confidentialité des utilisateurs en vérifiant leur acceptation des termes d'utilisation avant de collecter leurs messages.

## Fonctionnement

### Avant la collecte

1. **Récupération de la communauté** : Le daemon identifie la communauté associée au serveur Discord
2. **Vérification des termes** : Il récupère la liste des utilisateurs qui ont accepté les termes d'utilisation (statut `MEMBER` dans la table `learner`)
3. **Collecte des messages** : Les messages sont collectés normalement depuis Discord

### Pendant la sauvegarde

1. **Vérification par utilisateur** : Pour chaque message, le daemon vérifie si l'auteur a accepté les termes
2. **Anonymisation conditionnelle** :
    - ✅ **Utilisateur a accepté les termes** : Message sauvegardé normalement
    - ❌ **Utilisateur n'a pas accepté les termes** : Message anonymisé

## Anonymisation

Les messages des utilisateurs qui n'ont pas accepté les termes sont anonymisés avec les modifications suivantes :

### Informations anonymisées

- **ID utilisateur** : `anonymous_<original_id>`
- **Nom d'utilisateur** : `Utilisateur Anonyme`

### Structure des messages

Le daemon utilise la structure simplifiée du `DiscordHelper` :

```javascript
{
  id: '1405873000871497739',
  channel_id: '1382274365055569940', 
  author_name: 'monadressemailplus1',
  author_user_id: '1382833711787282432',
  content: 'cccool',
  created_at_by_discord: 2025-08-15T11:17:23.265Z,
  fetched_at: 2025-08-15T11:17:31.207Z
}
```

### Exemple

**Message original :**

```json
{
  "id": "1405873000871497739",
  "channel_id": "1382274365055569940",
  "author_name": "monadressemailplus1",
  "author_user_id": "1382833711787282432",
  "content": "cccool",
  "created_at_by_discord": "2025-08-15T11:17:23.265Z",
  "fetched_at": "2025-08-15T11:17:31.207Z"
}
```

**Message anonymisé :**

```json
{
  "id": "1405873000871497739",
  "channel_id": "1382274365055569940",
  "author_name": "Utilisateur Anonyme",
  "author_user_id": "anonymous_1382833711787282432",
  "content": "cccool",
  "created_at_by_discord": "2025-08-15T11:17:23.265Z",
  "fetched_at": "2025-08-15T11:17:31.207Z"
}
```

## Logique métier

### Critères d'acceptation des termes

Un utilisateur est considéré comme ayant accepté les termes s'il :

1. Est présent dans la table `learner`
2. A le statut `MEMBER` (et non `INVITED`, `BANNED`, ou `INVITATION_REJECTED`)
3. A un `discordId` valide

### Gestion des cas particuliers

- **Utilisateur sans Discord ID** : Messages non collectés (pas de correspondance possible)
- **Utilisateur invité mais pas encore membre** : Messages anonymisés
- **Utilisateur banni** : Messages anonymisés
- **Utilisateur ayant rejeté l'invitation** : Messages anonymisés

## Fichiers modifiés

### Services

- `apps/backend/src/discord/services/discord-message.service.ts`

    - Ajout de la méthode `anonymizeMessage()`
    - Ajout de la méthode `saveIfNewWithTermsCheck()`

- `apps/backend/src/learner/learner.service.ts`
    - Ajout de la méthode `getAcceptedUsersDiscordIds()`

### Daemon

- `apps/backend/src/daemon/discord/harvest-daemon.ts`
    - Intégration de la vérification des termes
    - Utilisation de `saveIfNewWithTermsCheck()` au lieu de `saveIfNew()`

### Tests

- `apps/backend/src/discord/services/discord-message.service.spec.ts`

    - Tests pour `saveIfNewWithTermsCheck()`

- `apps/backend/src/learner/learner.service.spec.ts`
    - Tests pour `getAcceptedUsersDiscordIds()`

## Logs

Le daemon affiche maintenant des informations sur la vérification des termes :

```
[Discord Daemon] Found 15 users who accepted terms for community 1
[Discord Daemon] Job abc123 done. 42 messages inserted.
```

## Sécurité et conformité

Cette implémentation garantit :

1. **Respect du RGPD** : Seuls les messages des utilisateurs consentants sont collectés avec leurs données personnelles
2. **Transparence** : Les utilisateurs savent que leurs messages peuvent être collectés s'ils acceptent les termes
3. **Contrôle granulaire** : Chaque communauté peut avoir ses propres termes d'utilisation
4. **Traçabilité** : Les messages anonymisés conservent le contenu mais pas l'identité

## Évolution future

- Possibilité d'ajouter des options de rétention pour les messages anonymisés
- Interface pour permettre aux utilisateurs de révoquer leur consentement
- Statistiques sur le taux d'anonymisation par communauté
