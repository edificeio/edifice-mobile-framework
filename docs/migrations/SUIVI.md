# Suivi calculé de la migration

> Généré par `yarn migration-status` le 2026-11-19, branche `feat/ia/migration-outillage`, commit `f9e168cb2`. **Ne pas modifier à la main** : relancer la commande. Le contexte et les décisions sont dans [STATUS.md](STATUS.md) ; le sens des colonnes est en bas de page.

## En bref

| Indicateur | Valeur |
| --- | ---: |
| Modules sur la nouvelle génération | 8 / 41 |
| Modules restant sur l'ancienne | 33 |
| Lignes dans les modules anciens | 62526 |
| Écrans anciens à porter (`<Stack.Screen>`) | 97 |
| Fichiers sur l'ancienne navigation | 219 |
| Fichiers avec `connect(` | 57 |

## Modules sur la nouvelle génération

| Module | Statut | Fichiers | Lignes | Écrans anciens | Écrans nouveaux | Navigation ancienne | `connect(` | Modules anciens importés | Notif. | Flows |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | :---: | ---: |
| `audience` | basculé, sans test | 2 | 48 | 0 | 0 | 0 | 0 | — | — | 0 |
| `auth` | bascule incomplète | 176 | 11356 | 0 | 22 | 2 | 0 | — | — | 0 |
| `editor` | basculé, sans test | 1 | 18 | 0 | 0 | 0 | 0 | — | — | 0 |
| `media` | bascule incomplète | 67 | 3854 | 0 | 2 | 1 | 0 | — | — | 0 |
| `myapps` | bascule incomplète | 66 | 3758 | 0 | 5 | 1 | 0 | — | — | 6 |
| `notifications` | basculé, sans test | 2 | 65 | 0 | 0 | 0 | 0 | — | — | 0 |
| `user` | basculé, sans test | 2 | 53 | 0 | 1 | 0 | 0 | — | — | 0 |
| `support` | bascule incomplète | 9 | 479 | 0 | 1 | 0 | 1 | `workspace` | — | 0 |

## Modules sur l'ancienne génération

| Module | Statut | Fichiers | Lignes | Écrans anciens | Écrans nouveaux | Navigation ancienne | `connect(` | Modules anciens importés | Notif. | Flows |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | :---: | ---: |
| `connectors/myStage77` | à faire | 4 | 51 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/creativeschool` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/element` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/moodle` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/myClasse77` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/salvum` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/wekan` | à faire | 4 | 53 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/peertube` | à faire | 4 | 60 | 1 | 0 | 1 | 0 | — | — | 0 |
| `connectors/lvs` | à faire | 8 | 138 | 1 | 0 | 3 | 1 | — | — | 0 |
| `connectors/pronote` | à faire | 7 | 253 | 2 | 0 | 2 | 0 | — | — | 0 |
| `collaborativewall` | à faire | 15 | 302 | 2 | 0 | 4 | 0 | — | oui | 0 |
| `scrapbook` | à faire | 16 | 391 | 2 | 0 | 3 | 0 | — | oui | 0 |
| `nabook` | à faire | 16 | 799 | 1 | 0 | 3 | 0 | — | oui | 0 |
| `widgets/cantine` | à faire | 14 | 963 | 1 | 0 | 3 | 0 | — | — | 0 |
| `viescolaire/edt` | à faire | 18 | 1100 | 1 | 0 | 3 | 1 | `viescolaire/dashboard` | — | 0 |
| `widgets/screen-time` | à faire | 19 | 1195 | 1 | 0 | 3 | 0 | — | — | 0 |
| `homework-assistance` | à faire | 31 | 1323 | 2 | 0 | 5 | 2 | — | — | 0 |
| `viescolaire/dashboard` | à faire | 22 | 1547 | 3 | 0 | 7 | 3 | `viescolaire/competences`, `viescolaire/diary`, `viescolaire/edt`, `viescolaire/presences` | — | 0 |
| `widgets/carnet-de-board` | à faire | 17 | 1624 | 1 | 0 | 4 | 1 | — | oui | 0 |
| `viescolaire/competences` | à faire | 31 | 1938 | 2 | 0 | 5 | 2 | `viescolaire/dashboard` | — | 0 |
| `mediacentre` | à faire | 46 | 1993 | 3 | 0 | 7 | 3 | — | oui | 0 |
| `news` | à faire | 44 | 2074 | 2 | 0 | 5 | 2 | — | oui | 0 |
| `viescolaire/diary` | à faire | 35 | 2237 | 4 | 0 | 10 | 2 | `viescolaire/dashboard`, `viescolaire/edt` | — | 0 |
| `schoolbook` | à faire | 20 | 2394 | 3 | 0 | 5 | 3 | — | oui | 0 |
| `workspace` | à faire | 25 | 2398 | 2 | 0 | 5 | 2 | — | oui | 0 |
| `homework` | à faire | 36 | 2626 | 6 | 0 | 7 | 4 | `workspace` | oui | 0 |
| `wiki` | à faire | 73 | 2725 | 4 | 0 | 9 | 0 | — | oui | 0 |
| `blog` | à faire | 45 | 3535 | 6 | 0 | 11 | 3 | `workspace` | oui | 0 |
| `form` | à faire | 46 | 4249 | 2 | 0 | 5 | 2 | — | oui | 0 |
| `user` | à faire | 74 | 4410 | 15 | 0 | 28 | 6 | `mails`, `workspace` | oui | 0 |
| `communities` | à faire | 144 | 6146 | 7 | 0 | 16 | 0 | `wiki` | oui | 0 |
| `viescolaire/presences` | à faire | 115 | 6374 | 6 | 0 | 15 | 6 | `viescolaire/competences`, `viescolaire/dashboard` | oui | 0 |
| `mails` | à faire | 114 | 9363 | 5 | 0 | 13 | 3 | `user`, `workspace` | oui | 0 |

## Dossiers sans déclaration de module

| Module | Statut | Fichiers | Lignes | Écrans anciens | Écrans nouveaux | Navigation ancienne | `connect(` | Modules anciens importés | Notif. | Flows |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | :---: | ---: |
| `audience` | — | 20 | 1309 | 0 | 0 | 4 | 3 | `blog` | — | 0 |
| `auth` | — | 36 | 2593 | 0 | 0 | 7 | 3 | `user` | — | 0 |
| `connectors/common` | — | 3 | 84 | 0 | 0 | 2 | 0 | — | — | 0 |
| `debug` | — | 13 | 535 | 0 | 0 | 3 | 0 | — | — | 0 |
| `explorer` | — | 11 | 463 | 0 | 0 | 2 | 0 | — | — | 0 |
| `media` | — | 7 | 32 | 0 | 0 | 0 | 0 | — | — | 0 |
| `splashads` | — | 7 | 229 | 0 | 0 | 2 | 0 | — | — | 0 |
| `timeline` | — | 45 | 2598 | 5 | 0 | 6 | 2 | `user` | oui | 0 |
| `viescolaire/common` | — | 14 | 1077 | 0 | 0 | 0 | 2 | `viescolaire/dashboard`, `viescolaire/diary`, `viescolaire/edt` | — | 0 |

## Lire ce tableau

- **Statut** : `à faire` (déclaré en `NavigableModule`) · `non chargé` (nouvelle déclaration, absent de `src/app/config/modules.ts`) · `bascule incomplète` (il reste de la navigation ancienne ou un import de module ancien) · `basculé, sans test` · `basculé, testable` (au moins un flow Maestro). Le statut ne dit pas que le module a été joué dans l’app : cela se note dans sa fiche.
- **Écrans anciens** : nombre de `<Stack.Screen>`. **Écrans nouveaux** : fichiers avec `defineScreen(` ou `defineModal(`.
- **Navigation ancienne** : fichiers avec `createModuleNavigator`, un import de `~/app/navigation`, `NativeStackScreenProps` ou `navigation.setOptions`.
- **Modules anciens importés** : modules encore en `NavigableModule` que ce module importe. L’app ne les charge pas : leur code s’exécute sans leur reducer ni leur initialisation.
- **Notif.** : le module a un `notif-handler`, sans équivalent dans le nouveau système pour l’instant.
- **Flows** : fichiers `.maestro/flows/<module>-*.yaml`.
- Les modules anciens sont triés du plus petit au plus gros.
