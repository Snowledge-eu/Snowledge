# Composants d'Analyse - Structure Refactorisée

## 🎯 **Vue d'ensemble**

Cette structure a été refactorisée pour éliminer la duplication de code entre les composants Summary et Trends. Tous les composants partagent maintenant une base commune tout en conservant leurs spécificités.

## 📁 **Structure des fichiers**

```
shared/
├── index.ts                    # Exports centralisés
├── README.md                   # Documentation
├── analysis-input-base.tsx     # Base pour tous les inputs d'analyse
├── analysis-list-base.tsx      # Base pour toutes les listes d'analyses
├── analysis-result-base.tsx    # Base pour les résultats d'analyses
├── trend-result-base.tsx       # Spécialisé pour les résultats de trends
├── summary-components.tsx      # Composants spécialisés pour Summary
└── trend-components.tsx        # Composants spécialisés pour Trends
```

## 🧩 **Composants de base**

### `AnalysisInputBase`

- **Rôle** : Composant de base pour tous les inputs d'analyse
- **Fonctionnalités** : Sélection plateforme, scope, time range, mode
- **Props** : `AnalysisInputBaseProps`
- **Spécialisations** : Support des prompts pour les trends

### `AnalysisListBase`

- **Rôle** : Composant de base pour toutes les listes d'analyses
- **Fonctionnalités** : Tableau avec colonnes adaptatives
- **Props** : `AnalysisListBaseProps`
- **Spécialisations** : Titres et clés de données selon le type

### `AnalysisResultBase`

- **Rôle** : Composant de base pour les résultats d'analyses
- **Fonctionnalités** : Structure commune (notable users, timeframe, platform)
- **Props** : `AnalysisResultBaseProps`
- **Spécialisations** : Contenu spécifique selon le type d'analyse

### `TrendResultBase`

- **Rôle** : Composant spécialisé pour les résultats de trends
- **Fonctionnalités** : Podium utilisateurs, accordéon des tendances
- **Props** : `{ result: any }`
- **Spécialisations** : Logique spécifique aux trends

## 🎨 **Composants spécialisés**

### Summary Components (`summary-components.tsx`)

- `SummaryInput` - Wrapper pour les inputs de summary
- `SummaryList` - Wrapper pour les listes de summary
- `SummaryResult` - Wrapper pour les résultats de summary

### Trend Components (`trend-components.tsx`)

- `TrendInput` - Wrapper pour les inputs de trends
- `TrendList` - Wrapper pour les listes de trends
- `TrendResult` - Wrapper pour les résultats de trends

## 📦 **Exports**

Tous les composants sont exportés depuis `index.ts` :

```typescript
// Composants de base
import {
  AnalysisInputBase,
  AnalysisListBase,
  AnalysisResultBase,
  TrendResultBase,
} from "./shared";

// Composants spécialisés Summary
import { SummaryInput, SummaryList, SummaryResult } from "./shared";

// Composants spécialisés Trends
import { TrendInput, TrendList, TrendResult } from "./shared";
```

## 🚀 **Utilisation**

### Pour les Summaries

```typescript
import { SummaryInput, SummaryList, SummaryResult } from '@/components/my-community/analysis/shared';

// Input
<SummaryInput {...props} />

// Liste
<SummaryList history={history} onSelect={onSelect} />

// Résultat
<SummaryResult {...resultProps} />
```

### Pour les Trends

```typescript
import { TrendInput, TrendList, TrendResult } from '@/components/my-community/analysis/shared';

// Input
<TrendInput {...props} />

// Liste
<TrendList history={history} onSelect={onSelect} />

// Résultat
<TrendResult result={result} />
```

## ✅ **Avantages de cette structure**

1. **DRY (Don't Repeat Yourself)** - Élimination de ~800 lignes de code dupliqué
2. **Maintenabilité** - Un seul endroit pour modifier la logique commune
3. **Cohérence** - Interface uniforme entre summary et trends
4. **Extensibilité** - Facile d'ajouter de nouveaux types d'analyses
5. **Tests** - Moins de code à tester, plus de réutilisabilité
6. **Organisation** - Structure claire et logique

## 🔄 **Migration**

Les anciens imports peuvent être remplacés par les nouveaux :

```typescript
// Avant
import { SummaryInput } from "./summary/summary-input";
import { TrendInputCard } from "./trend/trend-input";

// Après
import { SummaryInput, TrendInput } from "./shared";
```
