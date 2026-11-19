# Patron de bascule d'un module

> L'étape 1 d'[INTENT.md](INTENT.md) : faire changer un module de génération sans toucher à son comportement ni à son code interne. Proposition tirée d'un seul module, le plus simple ([support.md](support.md)) : à corriger au fil des modules suivants, puis à intégrer à la skill `migrate-module`.

## Avant de commencer

1. Lire [INTENT.md](INTENT.md), [CONVENTIONS.md](CONVENTIONS.md), la ligne du module dans [SUIVI.md](SUIVI.md).
2. Créer la fiche du module depuis [\_template-bascule.md](_template-bascule.md).
3. **Écrire les flows Maestro du module et les faire passer sur l'ancienne génération** ([.maestro/README.md](../../.maestro/README.md)).
4. Mesurer et garder les sorties : `yarn ts-all`, ESLint sur le dossier, `yarn test`.

## Les six gestes

| # | Avant | Après |
| --- | --- | --- |
| 1 | `module-config.ts` : `new NavigableModuleConfig({ entcoreScope, entcoreTrackingName, fileManager, matchEntcoreApp, name, … })` | supprimé ; ses champs passent dans `index.ts` : `scope`, `entTrackingName`, `fileManager`, `matchEntcoreApp`, `name` |
| 2 | `index.ts` : `module.exports = new NavigableModule({ config, getRoot, reducer })` | `export default new EntModule({ name, scope, matchEntcoreApp, entTrackingName, redux: { reducer }, screens, modals, entries })` |
| 3 | `navigation/navigator.tsx` : `createModuleNavigator(...)` et un `<Stack.Screen>` par écran ; `navigation/index.ts` : noms de routes et paramètres | les deux fichiers supprimés ; chaque `<Stack.Screen>` devient une entrée de `screens` (ou de `modals`) |
| 4 | écran : `computeNavBar` avec `navBarOptions(...)`, props `NativeStackScreenProps`, `props.navigation` | `export default defineScreen({ options, screen })` ; `useNavigation()` dans le composant |
| 5 | imports de `~/framework/modules/auth` (`getSession`, `assertSession`, types) | `~/modules/auth/store/accounts`, `~/modules/auth/model` |
| 6 | module absent du registre | une ligne dans `src/app/config/modules.ts` |

Le module reste à son emplacement (ARCHITECTURE §2). Reducer, styles, service et actions ne sont pas ouverts, sauf pour un import.

Exemple complet : le commit de bascule de `support`.

## S'arrêter et demander

- Le module importe un **module ancien** (colonne « Modules anciens importés » de [SUIVI.md](SUIVI.md)). Il compile, mais ce module n'est pas chargé par l'app.
- La bascule demande une **évolution du framework** (`src/app/`, `navigation-new`, `framework/util`) : elle part avant, dans un changement à part.
- Le module a un handler de notification, un widget, un intent ou une modale globale : pas d'équivalent dans le nouveau système pour l'instant ([later.md](later.md)).
- Plus de trois fichiers touchés hors du dossier du module, hors rebranchement de ses consommateurs.

## Ne pas faire pendant la bascule

zustand · `connect(` vers des hooks · classe vers fonction · refonte du modèle ou du service · changement d'API serveur · correction de bug · renommage · reformatage · erreurs `tsc` ou ESLint déjà présentes. Chaque envie se note en une ligne dans la fiche du module, §5.

## Vérifier

1. `tsc` comparé **fichier par fichier** avec la mesure d'avant (une erreur créée et une erreur supprimée s'annulent dans un total).
2. `yarn migration-status` : les compteurs du module sont à zéro, aucun module ancien importé.
3. `testID` et clés de stockage inchangés.
4. Les flows Maestro du module passent comme avant. Ce qui ne peut pas encore être joué dans l'app s'écrit dans la fiche, avec le module attendu.
5. Fiche, [JOURNAL.md](JOURNAL.md) et [SUIVI.md](SUIVI.md) mis à jour dans le même commit que le module.
