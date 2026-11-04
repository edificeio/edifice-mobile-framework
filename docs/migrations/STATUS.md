# État de la migration

> Mis à jour le **2026-11-04** (branche `feat/ia/vmou`). À mettre à jour en fin de chaque session (voir [README.md](README.md)).

## Ce qu'il faut savoir avant tout

- **L'app ne charge plus les modules anciens.** `src/app/config/modules.ts` ne liste que les modules nouveaux (et les modules de test `src/app/test/*`), et l'ancien registre `AllModules()` (`src/app/modules.ts`) renvoie `[]`. Un module ancien n'est donc pas « en attente » : il est **absent de l'app** tant qu'il n'est pas migré.
- Le code ancien qui appelle `AllModules().filterAvailables(…)` (ex. `myapps`) plante s'il est exécuté : il n'est plus atteignable que par des imports résiduels.
- Les modules **techniques** sont recodés dans `src/modules/`. Les modules **fonctionnels** seront migrés **sur place** dans `src/framework/modules/` (voir ARCHITECTURE §2).

## Modules nouveaux (`src/modules/`)

| Module          | Statut   | Résumé                                                                                                                | Fiche                  |
| --------------- | -------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `auth`          | fait     | Redux → zustand, flows, cycle de session. Façades `@deprecated` dans `framework/modules/auth` (274 imports externes). | [auth.md](auth.md)     |
| `media`         | fait     | Carrousel, PDF, téléchargement, composants signés. Façades `@deprecated` dans `framework/modules/media`.              | [media.md](media.md)   |
| `audience`      | en cours | Charge les types de réactions à `onSessionStart`. Pas d'écran ; le service reste dans `framework/modules/audience`.   | —                      |
| `editor`        | en cours | Rafraîchit le `oneSessionId` à `onSessionStart`. Pas d'écran.                                                         | —                      |
| `notifications` | en cours | Enregistre / désenregistre le push (FCM) par session. **Pas d'ouverture de notification** (voir chantiers).           | —                      |
| `myapps`        | spec     | Onglet déclaré, écran vide, `service.ts` copié mais cassé (types non importés).                                       | [myapps.md](myapps.md) |
| `user`          | en cours | Seulement l'accueil (comptes + déconnexion). Le reste est dans `framework/modules/user`.                              | —                      |

## Modules anciens (`src/framework/modules/`)

Tous `à faire` sauf mention. Ordre indicatif de la todo : **myapps → user → timeline**.

| Module                                                                                                                                                                                     | Statut  | Remarque                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `myapps`                                                                                                                                                                                   | spec    | Remplacé par `src/modules/myapps`. Fournit thème/couleurs des apps à 7 fichiers anciens + `media` (voir [myapps.md](myapps.md)).                            |
| `user`                                                                                                                                                                                     | à faire | Ses écrans `change-email` / `change-mobile` / `mfa` utilisent encore des écrans de `framework/modules/auth` (à supprimer avec lui).                         |
| `timeline`                                                                                                                                                                                 | à faire | `index.tsx` est un `EntModule` d'une **API intermédiaire obsolète** (2ᵉ argument `Stack => …`, clé `storage`) : ne compile pas avec l'actuelle, non chargé. |
| `audience`, `media`                                                                                                                                                                        | façades | Restes utilisés par les modules nouveaux du même nom.                                                                                                       |
| `auth`                                                                                                                                                                                     | façades | Voir [auth.md](auth.md).                                                                                                                                    |
| `blog`, `collaborativewall`, `communities`, `form`, `homework`, `homework-assistance`, `mails`, `mediacentre`, `nabook`, `news`, `schoolbook`, `scrapbook`, `support`, `wiki`, `workspace` | à faire | `NavigableModule`.                                                                                                                                          |
| `connectors/*`, `viescolaire/*`, `widgets/*`                                                                                                                                               | à faire | Dossiers de sous-modules (11 connecteurs, 5 vie scolaire, 3 widgets `MYAPPS_WIDGET`).                                                                       |
| `debug`, `explorer`, `splashads`                                                                                                                                                           | à faire | Pas d'`index.ts` de module : utilitaires à classer.                                                                                                         |

## Chantiers transverses

| Chantier                                     | Statut   | Notes                                                                                                                                                                                  |
| -------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Droits : filtrer les modules par session     | à faire  | `useModuleTabRoutes` (`src/app/navigation-new/tabs.tsx`) affiche tous les onglets (`ToDo : filter from session.rights`). Prérequis de `myapps` (voir sa fiche).                        |
| Libellés / couleurs des onglets              | à faire  | `tabs.tsx` affiche le `testId` comme libellé (`@todo get names from myApps`). Fourni par `myapps`.                                                                                     |
| Notifications (ouverture, redirection)       | à faire  | Pas d'équivalent de `notif-handler.ts` / `registerNotifHandlers` dans le nouveau système. Question : un module `notifications` qui porte le registre, ou une clé de config de module ? |
| Intents (`openIntent`, `src/app/intents.ts`) | à faire  | Restent anciens. `media` (`useOpenMedia`) y délègue l'ouverture des ressources d'apps ; destinés à passer par `myapps`.                                                                |
| Modal / FormSheet « as promise »             | à faire  | Ouvrir une modale et `await` son résultat. Candidats : modale favoris de `myapps`, sélecteurs (`BlogSelectScreen`, `HomeworkSelectScreen`).                                            |
| `framework/util/media-deprecated`            | en cours | 35 importeurs, migrés module par module vers les composants de `src/modules/media`, puis suppression.                                                                                  |
| Retirer l'ancienne auth                      | à faire  | Bloqué par `user` (écrans) et par les 274 imports des façades. `flows/legacy-redux.ts` dispatch encore pour `viescolaire`.                                                             |
| Retirer l'ancienne navigation                | à faire  | `src/app/navigation/` : 38 fichiers l'importent encore (36 pour `navigation-new`). L'ancien `index.tsx` importe `navigation-new/confirm-remove` et `telemetry`.                        |
| Doc navigation (fin)                         | en cours | ARCHITECTURE §3. Manque : exemple de module avec onglet, modales de module, navigation inter-onglets.                                                                                  |
| Doc authentification                         | à faire  | Une série `docs-temp/auth/` (00-21 + diagrammes Mermaid) a été écrite pour Confluence : **absente de ce checkout** (seulement dans un stash de `feat/navigation`). À récupérer.        |
| Tests des flows auth                         | reporté  | Décision : après documentation du service auth (`setActiveAccount`, `restoreAccount`…).                                                                                                |

## Prochaines étapes

1. Valider les questions ouvertes de [myapps.md](myapps.md) (§7), puis démarrer sa phase 1.
2. Récupérer la série `docs-temp/auth/` et décider de sa place (`docs/auth/` ?).
3. Trancher l'architecture des notifications avant `timeline` (qui en dépend le plus).
