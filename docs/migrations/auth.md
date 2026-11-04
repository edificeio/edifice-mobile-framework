# Migration : `auth`

> Statut : **fait** (legacy encore présent sous forme de façades) — mis à jour le 2026-11-04

## 1. Périmètre

Comptes, connexion (sign-in), requirements (CGU, mot de passe, MFA, vérification e-mail / mobile), sessions et leur cycle de vie, transport signé. `src/framework/modules/auth` → `src/modules/auth`, redux → zustand.

## 2. Ce qui est en place

- **Stores zustand indépendants** (pas de slices) : `accounts` (persisté en MMKV, format inchangé ; `oneSessionId`, `queryParamToken` et jetons carbonio jamais persistés), `sign-in`, `platform-context`, `platform-legal-urls`. Stores de session : `createSessionStore` (`src/modules/auth/store/session.ts`), vidés à chaque fin de session.
- **Flows** construits par `createAuthFlows({ lifecycle })` et exposés par `useAuthFlows()` (`src/modules/auth/flows/index.ts`), fournis par `AuthFlowsProvider` (déclaré dans `src/app/providers.ts`) : `setActiveAccount`, `restoreAccount`, `restoreAtStartup`, `refreshRequirements`, `revalidateTerms`, `changePassword`, `changePasswordRequirement`, `logout`, `removeAccount`.
- **Cycle de session** des modules (`src/modules/auth/lifecycle.ts`, clés de config dans `src/app/module/types.ts`) : `sessionSetup` (bloquant, avant la session, renvoie `{ commit }`), `onSessionStart` (non attendu, `signal`), `onSessionRelease` (idempotent, appelé par le framework). `callAtLogin` est `@deprecated`.
- **Étapes d'auth** : `signedOut | requirement | signedIn` (`useAuthStage`), qui pilotent le `RootStack` de `navigation-new`.
- **API publique côté React** : dossiers `hooks/`, `hoc/`, `components/` (sauf `components/account-list`, interne). Le non-React (`store/accounts`, `flows`, `model`) s'importe directement. **Ne jamais importer `~/modules/auth`** (définition du module chargée en lazy : cycles).
- **Templates publics** réutilisables par `user` : `src/modules/auth/templates/` (`change-password`, `mfa`, `verify-email`, `verify-mobile`…), tout par props.
- **Tests Jest** : stores, persistance des comptes, navigation du sign-in, `logout`, `removeAccount`, `restoreAccount`, refresh OAuth2.

## 3. Reste à faire

| Sujet                                     | Bloqué par          | Détail                                                                                                                                                                                                                                                                       |
| ----------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supprimer `src/framework/modules/auth`    | `user`, 274 imports | Façades `@deprecated` (`thunks`, `service`, `redux/*`, `model`, `tracking`, `calls-at-login`, `util`) + anciens écrans `change-email` / `change-mobile` / `mfa` et `templates/change-password` encore utilisés par `user`. `new-navigation.ts` = ancienne navigation racine. |
| `logoutAction` legacy                     | `user`              | Lève une erreur (`TODO(auth-migration)` dans `thunks.ts`) : les boutons de déconnexion de `user/home`, `change-email`, `change-mobile` doivent passer à `useAuthFlows().logout`.                                                                                             |
| `flows/legacy-redux.ts`                   | `viescolaire`       | Dispatch encore `addAccount` / `replaceAccount` pour les `sessionReducers` de vie scolaire.                                                                                                                                                                                  |
| Transport : refresh impossible → `logout` | —                   | **Tâche indépendante** (voir [STATUS.md](STATUS.md), chantiers transverses). `TODO(auth-migration)` dans `src/framework/util/transport/fetch.ts`.                                                                                                                            |
| Tests des flows                           | doc du service      | Reporté (décision utilisateur).                                                                                                                                                                                                                                              |
| Documentation                             | —                   | À écrire dans `docs/`.                                                                                                                                                                                                                                                       |

## 4. Décisions clés

- Passer des **noms** de plateforme ; `appConf.assertPlatformOfName` / `getExpandedPlatform` le plus tard possible.
- Vocabulaire : « active » (compte actif), jamais « activate » (confusion avec l'activation de compte) ; `sleep` = garder les jetons, notifications coupées.
- Le sign-in ne sait pas s'il ajoute ou remplace un compte : l'écran hôte passe `onSignedIn` par `SignInContext`.
- `restoreAccount` ne lève jamais : en cas d'échec il pose le statut de restauration et met la session en veille.
- Les écrans sont **portés tels quels** (mêmes composants, classes comprises) : la qualité s'améliore plus tard, écran par écran.
- Accès aux modules : React d'abord + injection (`useModules()` → `createSessionLifecycle`), **pas de registre statique**, pas de synchronisation par observation de store.
