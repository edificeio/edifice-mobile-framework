# État de la migration

> Mis à jour le **2026-11-06** (branche `feat/ia/vmou`). À mettre à jour en fin de chaque session (voir [README.md](README.md)).

## Ce qu'il faut savoir avant tout

- **L'app ne charge plus les modules anciens.** `src/app/config/modules.ts` ne liste que les modules nouveaux (et les modules de test `src/app/test/*`), et l'ancien registre `AllModules()` (`src/app/modules.ts`) renvoie `[]`. Un module ancien n'est donc pas « en attente » : il est **absent de l'app** tant qu'il n'est pas migré.
- Le code ancien qui appelle `AllModules().filterAvailables(…)` (ex. `myapps`) plante s'il est exécuté : il n'est plus atteignable que par des imports résiduels.
- Les modules **techniques** sont recodés dans `src/modules/`. Les modules **fonctionnels** seront migrés **sur place** dans `src/framework/modules/` (voir ARCHITECTURE §2).

## Modules nouveaux (`src/modules/`)

| Module          | Statut   | Résumé                                                                                                                                                                                                                                                     | Fiche                  |
| --------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `auth`          | fait     | Redux → zustand, flows, cycle de session. Façades `@deprecated` dans `framework/modules/auth` (274 imports externes).                                                                                                                                      | [auth.md](auth.md)     |
| `media`         | fait     | Carrousel, PDF, téléchargement, composants signés. Façades `@deprecated` dans `framework/modules/media`.                                                                                                                                                   | [media.md](media.md)   |
| `audience`      | en cours | Seulement ce qui était dans `auth` : chargement des types de réactions à `onSessionStart` (store `src/modules/audience/store.ts`). Le reste est encore dans `framework/modules/audience` (voir modules anciens).                                           | —                      |
| `editor`        | en cours | Rafraîchit le `oneSessionId` à `onSessionStart`. Pas d'écran.                                                                                                                                                                                              | —                      |
| `notifications` | en cours | Enregistre / désenregistre le push (FCM) par session. **Pas d'ouverture de notification** (reportée, voir plus bas).                                                                                                                                       | —                      |
| `myapps`        | en cours | Phases 0 et 1 faites : droits / `entry` / `useOpenModule`, puis `EntModule` avec modèle, service, reducer Redux, storage. Conception des données revue et appliquée le 2026-11-06 (phase 1 bis). Rien ne charge encore les données (phase 2) ; écran vide. | [myapps.md](myapps.md) |
| `user`          | en cours | Seulement l'accueil (comptes + déconnexion). Le reste est dans `framework/modules/user`.                                                                                                                                                                   | —                      |

## Modules anciens (`src/framework/modules/`)

Tous `à faire` sauf mention. Ordre indicatif : **myapps → user → timeline**.

| Module                                                                                                                                                                                     | Statut   | Remarque                                                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `myapps`                                                                                                                                                                                   | en cours | Remplacé par `src/modules/myapps`. Fournit thème/couleurs des apps à 7 fichiers anciens + `media` (voir [myapps.md](myapps.md)).                                                                                               |
| `user`                                                                                                                                                                                     | à faire  | Ses écrans `change-email` / `change-mobile` / `mfa` utilisent encore des écrans de `framework/modules/auth` (à supprimer avec lui).                                                                                            |
| `timeline`                                                                                                                                                                                 | à faire  | `index.tsx` est un `EntModule` d'une **API intermédiaire obsolète** (2ᵉ argument `Stack => …`, clé `storage`) : ne compile pas avec l'actuelle, non chargé.                                                                    |
| `audience`                                                                                                                                                                                 | à faire  | **Pas migré** : seule la partie qui était dans `auth` est passée dans `src/modules/audience`. Restent `service.ts` (utilisé par le nouveau module), `components/` (bouton de réactions…) et les écrans `reactions` et `views`. |
| `auth`, `media`                                                                                                                                                                            | façades  | Voir [auth.md](auth.md), [media.md](media.md).                                                                                                                                                                                 |
| `blog`, `collaborativewall`, `communities`, `form`, `homework`, `homework-assistance`, `mails`, `mediacentre`, `nabook`, `news`, `schoolbook`, `scrapbook`, `support`, `wiki`, `workspace` | à faire  | `NavigableModule`.                                                                                                                                                                                                             |
| `connectors/*`, `viescolaire/*`, `widgets/*`                                                                                                                                               | à faire  | Dossiers de sous-modules (11 connecteurs, 5 vie scolaire, 3 widgets `MYAPPS_WIDGET`).                                                                                                                                          |
| `debug`, `explorer`, `splashads`                                                                                                                                                           | à faire  | Pas d'`index.ts` de module : utilitaires à classer.                                                                                                                                                                            |

## Chantiers transverses

| Chantier                                           | Statut   | Notes                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Droits : filtrer les modules par session           | fait     | `isModuleAvailableForUser(module, session)` (`src/app/module/rights.ts`) et `useUserAvailableModules()`, faits en phase 0 de `myapps` (2026-11-04). Les onglets des modules indisponibles sont masqués (`tabs.tsx`). Ouvrir un module : `useOpenModule` (`src/app/navigation-new/open-module.ts`).              |
| Libellés / couleurs des onglets                    | spec     | `tabs.tsx` affiche le `testId` comme libellé (`@todo get names from myApps`). Fourni par `useTabLabel` de `myapps` (phase 3).                                                                                                                                                                                   |
| Conversions d'UI (bottom sheets, modales)          | à faire  | Au fil des modules (règle de [CONVENTIONS.md](CONVENTIONS.md)) : `@gorhom/bottom-sheet` → `formSheet` (12 fichiers l'importent, 22 utilisent les wrappers), `react-native-modal` → `transparentModal` (3 fichiers, dont `ModalBox` utilisé par 15).                                                             |
| Supprimer `framework/util/media-deprecated`        | à faire  | **À supprimer entièrement.** Ses 35 importeurs passent aux composants de `src/modules/media` (`Image`, `FastImage`…).                                                                                                                                                                                           |
| Transport : refresh de jeton impossible → `logout` | à faire  | Tâche indépendante. `TODO(auth-migration)` dans `src/framework/util/transport/fetch.ts` : le transport importe `refreshOAuth2Token` en statique ; quand le refresh échoue, il devrait pouvoir appeler `logout`, qui n'est accessible que par les flows (`useAuthFlows()` ou injection par `AuthFlowsProvider`). |
| Retirer l'ancienne auth                            | à faire  | Bloqué par `user` (écrans) et par les 274 imports des façades. `flows/legacy-redux.ts` dispatch encore pour `viescolaire`.                                                                                                                                                                                      |
| Retirer l'ancienne navigation                      | à faire  | `src/app/navigation/` : 38 fichiers l'importent encore (36 pour `navigation-new`). L'ancien `index.tsx` importe `navigation-new/confirm-remove` et `telemetry`.                                                                                                                                                 |
| Doc navigation (fin)                               | en cours | ARCHITECTURE §3. Manque : exemple de module avec onglet, modales de module, navigation inter-onglets.                                                                                                                                                                                                           |
| Doc authentification                               | à faire  | À écrire dans `docs/` (pas de reprise d'une série existante).                                                                                                                                                                                                                                                   |
| Tests des flows auth                               | à faire  | Décision : après documentation du service auth (`setActiveAccount`, `restoreAccount`…).                                                                                                                                                                                                                         |

## Reportés et « plus tard »

Voir [later.md](later.md) : sujets reportés (notifications, intents, modale « as promise ») et décisions acceptées pour l'instant mais à revoir.

## Questions ouvertes

Points flous à valider ou à débattre. Une question tranchée part dans la fiche concernée (section « Décisions ») et sort de cette liste.

### Architecture

1. **Notifications vs `timeline`.** Qui porte l'ouverture des notifications : un registre dans le module `notifications` (les modules s'y déclarent), ou une clé de config de module (`notifications: { 'BLOG.PUBLISH-POST': handler }`) lue par le framework ? Et que garde `timeline` : seulement l'écran du fil, ou aussi les définitions des types de notifications (`notif-definitions`, aujourd'hui en redux, lues par `useNotificationBadge`) ? Reporté, mais à trancher **avant de migrer `timeline`**.
2. **Reste d'`audience`.** Ses composants (bouton de réactions) et écrans sont utilisés par des modules fonctionnels : les migrer dans `src/modules/audience` avant eux, ou au fil de l'eau ?

Tranchées le 2026-11-04 : `isModuleAvailable` en phase 0 de `myapps` ; ordre des onglets sur la nouvelle échelle (`timeline` = 0, `myapps` = 40) ; route d'entrée = clé `entry` facultative, dont `tab.route` hérite ; `useOpenModule` = API publique du framework.

### `myapps`

Aucune question bloquante. Phases 0, 1 et 1 bis faites ; phase 2 à démarrer. Les détails de `GET /api/me/applications` sont dans [later.md](later.md).

## Prochaines étapes

1. `myapps` : phase 2 (chargement : `sessionSetup` des apps, `onSessionStart` des préférences).
2. Trancher la question 1 (notifications) avant `timeline`.
