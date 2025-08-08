# Composants d'Analyse - Architecture Cohérente

## 🎯 **Vue d'ensemble**

Cette structure a été refactorisée pour éliminer la duplication de code entre les composants Summary et Trends. L'architecture suit maintenant un pattern cohérent avec une vraie séparation entre base et spécialisations.

## 📁 **Structure des fichiers**

```
shared/
├── index.ts                    # Exports centralisés
├── README.md                   # Documentation
├── analysis-input-base.tsx     # Base pour tous les inputs d'analyse
├── analysis-list-base.tsx      # Base pour toutes les listes d'analyses
├── analysis-result-base.tsx    # Base commune pour les résultats (structure pure)
├── summary-result-base.tsx     # Spécialisé pour les résultats de summaries
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

- **Rôle** : Composant de base pour les résultats d'analyses (structure commune pure)
- **Fonctionnalités** : Card, header, footer, notable users (pas de logique métier)
- **Props** : `AnalysisResultBaseProps`
- **Pattern** : Utilise `children` pour injecter le contenu spécifique

## 🎨 **Composants spécialisés**

### `SummaryResultBase`

- **Rôle** : Composant spécialisé pour les résultats de summaries
- **Fonctionnalités** : Summary text + action points
- **Architecture** : Utilise `AnalysisResultBase` + contenu spécifique

### `TrendResultBase`

- **Rôle** : Composant spécialisé pour les résultats de trends
- **Fonctionnalités** : Podium utilisateurs + accordéon des tendances
- **Architecture** : Utilise `AnalysisResultBase` + contenu spécifique

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
  SummaryResultBase,
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

## ✅ **Avantages de cette architecture**

1. **DRY (Don't Repeat Yourself)** - Élimination de ~800 lignes de code dupliqué
2. **Cohérence architecturale** - Vraie séparation base/spécialisations
3. **Maintenabilité** - Un seul endroit pour modifier la logique commune
4. **Extensibilité** - Facile d'ajouter de nouveaux types d'analyses
5. **Tests** - Moins de code à tester, plus de réutilisabilité
6. **Organisation** - Structure claire et logique

## 🏗️ **Pattern architectural**

```
AnalysisResultBase (structure commune)
├── SummaryResultBase (contenu spécifique)
└── TrendResultBase (contenu spécifique)
```

Cette architecture garantit :
- **Pas de duplication** de structure commune
- **Séparation claire** entre base et spécialisations
- **Cohérence** entre tous les types de résultats
- **Extensibilité** pour de nouveaux types d'analyses

## 🔄 **Migration**

Les anciens imports peuvent être remplacés par les nouveaux :

```typescript
// Avant
import { SummaryInput } from "./summary/summary-input";
import { TrendInputCard } from "./trend/trend-input";

// Après
import { SummaryInput, TrendInput } from "./shared";
```
