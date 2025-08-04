# Système de Prompts - Administration

## Vue d'ensemble

Le système de prompts permet aux administrateurs de gérer les prompts d'analyse IA stockés en base de données. Il remplace progressivement le système YAML existant.

## Architecture

### Structure des fichiers

```
src/prompt/
├── entities/
│   └── prompt.entity.ts          # Entité Prompt
├── dto/
│   ├── create-prompt.dto.ts      # DTO création
│   ├── update-prompt.dto.ts      # DTO mise à jour
│   └── test-analysis.dto.ts      # DTO test d'analyse
├── prompt.controller.ts           # Contrôleur HTTP
├── prompt.provider.ts            # Logique métier
├── prompt.service.ts             # Accès aux données
├── prompt.helper.ts              # Utilitaires
├── prompt.module.ts              # Module NestJS
└── README.md                     # Documentation
```

### Composants

- **Controller** : Expose les routes HTTP `/admin/prompts`
- **Provider** : Orchestre la logique métier et les vérifications admin
- **Service** : Gère l'accès aux données (CRUD)
- **Helper** : Fonctions utilitaires (validation, formatage)

## Fonctionnalités

### 1. Gestion des Prompts

- ✅ **Création** : Créer de nouveaux prompts avec préprompt
- ✅ **Modification** : Éditer les prompts existants
- ✅ **Suppression** : Supprimer des prompts
- ✅ **Visibilité** : Rendre les prompts publics ou privés
- ✅ **Migration** : Migrer les prompts du YAML vers la BD

### 2. Test d'Analyses

- ✅ **Sélection** : Choisir un prompt et une communauté
- ✅ **Configuration** : Modifier le modèle IA utilisé
- ✅ **Lancement** : Tester les analyses en temps réel
- ✅ **Résultats** : Afficher les résultats d'analyse

### 3. Sécurité

- ✅ **Authentification** : Vérification JWT obligatoire
- ✅ **Autorisation** : Seuls les admins (`isAdmin: true`) peuvent accéder
- ✅ **Validation** : Validation des données entrantes

## API Endpoints

### Prompts

```
GET    /admin/prompts              # Liste des prompts
POST   /admin/prompts              # Créer un prompt
GET    /admin/prompts/:id          # Détails d'un prompt
PATCH  /admin/prompts/:id          # Modifier un prompt
DELETE /admin/prompts/:id          # Supprimer un prompt
POST   /admin/prompts/migrate-yaml # Migrer depuis YAML
POST   /admin/prompts/test-analysis # Tester une analyse
```

### Administration

```
GET    /admin/communities          # Liste des communautés
GET    /admin/communities/:id/messages # Messages d'une communauté
GET    /admin/stats                # Statistiques admin
```

## Migration depuis YAML

Le système permet de migrer les prompts existants du fichier YAML vers la base de données :

```bash
# Script de migration
npm run migrate:prompts

# Ou via l'API
POST /admin/prompts/migrate-yaml
```

## Structure des Prompts

```typescript
interface Prompt {
  id: number;
  name: string;                    # Nom unique
  description: string;             # Description
  platform: string;               # 'discord' | 'youtube'
  temperature: number;            # 0.0 - 2.0
  top_p: number;                 # 0.0 - 1.0
  messages: any[];               # Messages système/user
  response_format: any;          # Format de réponse
  is_public: boolean;            # Visibilité
  created_by_id: number;         # Créateur
  created_at: Date;
  updated_at: Date;
}
```

## Utilisation Frontend

La page d'administration (`/admin`) permet de :

1. **Gérer les prompts** : Liste, création, modification, suppression
2. **Tester les analyses** : Sélection prompt + communauté + lancement
3. **Voir les communautés** : Liste avec messages Discord
4. **Configurer les modèles** : Changer le modèle IA utilisé

## Sécurité

- Toutes les routes admin sont protégées par `AuthGuard` + `AdminGuard`
- Vérification `isAdmin: true` sur chaque endpoint
- Validation des données avec class-validator
- Gestion des erreurs avec messages appropriés

## Tests

```bash
# Tests unitaires
npm run test prompt.controller.spec.ts
npm run test prompt.service.spec.ts

# Tests d'intégration
npm run test:e2e
```
