# Composants d'Analyse - Organisation par Type

## 🎯 **Vue d'ensemble**

Cette structure organise les composants par type d'analyse (Summary et Trends) avec des composants spécialisés qui contiennent toute la logique spécifique. Les composants de base fournissent la structure commune.

## 📁 **Structure des fichiers**

```
shared/
├── index.ts                    # Exports centralisés
├── README.md                   # Documentation
├── analysis-input-base.tsx     # Base pour tous les inputs d'analyse
├── analysis-list-base.tsx      # Base pour toutes les listes d'analyses
├── analysis-result-base.tsx    # Base commune pour les résultats
├── summary-components.tsx      # Composants spécialisés Summary (Input, List, Result)
├── trend-components.tsx        # Composants spécialisés Trends (Input, List, Result)
├── analysis-description.tsx    # Description des types d'analyse
├── platform-icon-buttons.tsx   # Sélection de plateformes
├── platform-and-scope-row.tsx  # Affichage plateforme/scope
└── timeframe-badge.tsx         # Badge de période
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
- **Fonctionnalités** : Structure commune (Card, header, footer, notable users)
- **Props** : `AnalysisResultBaseProps`
- **Pattern** : Utilise `children` pour injecter le contenu spécifique

## 🎨 **Composants spécialisés**

### Summary Components (`summary-components.tsx`)

- **`SummaryInput`** - Input spécialisé pour les summaries
- **`SummaryList`** - Liste spécialisée pour les summaries
- **`SummaryResult`** - Résultat spécialisé avec summary + action points

### Trend Components (`trend-components.tsx`)

- **`TrendInput`** - Input spécialisé pour les trends
- **`TrendList`** - Liste spécialisée pour les trends
- **`TrendResult`** - Résultat spécialisé avec podium + accordéon

### Composants communs

- **`AnalysisDescription`** - Description des types d'analyse
- **`PlatformIconButtons`** - Sélection de plateformes avec icônes
- **`PlatformAndScopeRow`** - Affichage plateforme et scope
- **`TimeframeBadge`** - Badge pour afficher la période

## 📦 **Exports**

Tous les composants sont exportés depuis `index.ts` :

```typescript
// Composants de base
import {
  AnalysisInputBase,
  AnalysisListBase,
  AnalysisResultBase,
  type AnalysisInputBaseProps,
  type AnalysisListBaseProps,
  type AnalysisResultBaseProps,
} from "@/components/my-community/analysis/shared";

// Composants spécialisés Summary
import { SummaryInput, SummaryList, SummaryResult } from "@/components/my-community/analysis/shared";

// Composants spécialisés Trends
import { TrendInput, TrendList, TrendResult } from "@/components/my-community/analysis/shared";

// Composants communs
import {
  AnalysisDescription,
  PlatformIconButtons,
  PlatformAndScopeRow,
  TimeframeBadge,
} from "@/components/my-community/analysis/shared";
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

## ✅ **Avantages de cette organisation**

1. **Organisation par type** - Logique regroupée par type d'analyse
2. **Spécialisation** - Chaque composant contient sa logique spécifique
3. **Réutilisabilité** - Composants de base partagés
4. **Maintenabilité** - Structure claire et organisée
5. **Extensibilité** - Facile d'ajouter de nouveaux types

## 🎯 **Pattern d'utilisation**

```typescript
// Pour summaries
import { SummaryInput, SummaryList, SummaryResult } from './shared';

// Pour trends
import { TrendInput, TrendList, TrendResult } from './shared';

// Utilisation simple et directe
<SummaryInput {...props} />
<TrendInput {...props} />
```

Cette organisation garantit :
- **Simplicité** - Imports directs par type
- **Spécialisation** - Logique spécifique dans chaque composant
- **Cohérence** - Interface uniforme par type
- **Flexibilité** - Réutilisation des composants de base
