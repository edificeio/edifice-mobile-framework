# Migration : `auth`

> Statut : **fait** (legacy encore présent sous forme de façades), assainissement en cours — mis à jour le 2026-11-19
>
> Ancienne fiche longue (statuts `spec` · `en cours` · `fait` · `nettoyé`, voir [README.md](README.md)). Le module a été **réécrit** (`src/framework/modules/auth` → `src/modules/auth`, Redux → zustand) avant les skills ; il n'est pas passé par `/migrate-module`. Son assainissement suit `/sanitize-module` (§5, §9).

## 1. Périmètre

Comptes, connexion (sign-in), requirements (CGU, mot de passe, MFA, vérification e-mail / mobile), sessions et leur cycle de vie, transport signé. `src/framework/modules/auth` → `src/modules/auth`, redux → zustand.

## 2. Ce qui est en place

- **Stores zustand indépendants** (pas de slices) : `accounts` (persisté en MMKV, format inchangé ; `oneSessionId`, `queryParamToken` et jetons carbonio jamais persistés), `sign-in`, `platform-context`, `platform-legal-urls`. Stores de session : `createSessionStore` (`src/modules/auth/store/session.ts`), vidés à chaque fin de session.
- **Flows** construits par `createAuthFlows({ lifecycle })` et exposés par `useAuthFlows()` (`src/modules/auth/flows/index.ts`), fournis par `AuthFlowsProvider` (déclaré dans `src/app/providers.ts`) : `setActiveAccount`, `restoreAccount`, `restoreAtStartup`, `refreshRequirements`, `revalidateTerms`, `changePassword`, `changePasswordRequirement`, `logout`, `removeAccount`.
- **Cycle de session** des modules (`src/modules/auth/lifecycle.ts`, clés de config dans `src/app/module/types.ts`) : `sessionSetup` (bloquant, avant la session, renvoie `{ commit }`), `onSessionStart` (non attendu, `signal`), `onSessionRelease` (idempotent, appelé par le framework). `callAtLogin` est `@deprecated` (encore utilisé par `mails`).
- **Étapes d'auth** : `signedOut | requirement | signedIn` (`useAuthStage`), qui pilotent le `RootStack` de `navigation-new`.
- **API publique côté React** : dossiers `hooks/`, `hoc/`, `components/` (seulement `accounts-button` : `components/account-list` est interne, retiré de `components/index.ts` le 2026-11-19). Les hooks internes sont à côté de leurs écrans (`screens/hooks.ts`, `sign-in/hooks.ts`). Le non-React (`store/accounts`, `flows`, `model`) s'importe directement. **Ne jamais importer `~/modules/auth`** (définition du module chargée en lazy : cycles).
- **Templates publics** réutilisables par `user` : `src/modules/auth/templates/` (`change-password`, `mfa`, `verify-email`, `verify-mobile`…), tout par props.
- **Service** : `service/types.ts` en `namespace API` (formats du backend) ; les formats identiques au modèle sont écrits dans `model/index.ts` et aliasés par `API` (CONVENTIONS « Structure d'un module », décidé le 2026-11-19).
- **Tests Jest** : stores, persistance des comptes, navigation du sign-in, `logout`, `removeAccount`, `restoreAccount`, refresh OAuth2.

## 3. Reste à faire

| Sujet | Bloqué par | Détail |
| --- | --- | --- |
| Supprimer `src/framework/modules/auth` | `user`, 329 imports dans 257 fichiers (2026-11-19) | Façades `@deprecated` (`thunks`, `service`, `redux/*`, `model`, `tracking`, `calls-at-login`, `util`, `module-config` pour les types d'actions de `redux/actions.ts`) + anciens écrans `change-email` / `change-mobile` / `mfa` et `templates/change-password` encore utilisés par `user`. `new-navigation.ts` = ancienne navigation racine. Façades sans importeur supprimées le 2026-11-19 (`model/business.ts`, `model/error.ts`). |
| `logoutAction` legacy | `user` | Lève une erreur (`TODO(auth-migration)` dans `thunks.ts`) : les boutons de déconnexion de `user/home`, `change-email`, `change-mobile` doivent passer à `useAuthFlows().logout`. |
| `flows/legacy-redux.ts` | `viescolaire` | Dispatch encore `addAccount` / `replaceAccount` pour les `sessionReducers` de vie scolaire. |
| Import de `~/app/navigation/types` | nettoyage final | `src/modules/auth/sign-in/screens/welcome/types.ts` (`ModuleScreenProps`) : laissé tant que toutes les migrations ne sont pas finies, traité dans le nettoyage final ([later.md](later.md)). Laisse `auth` en `bascule incomplète` dans [SUIVI.md](SUIVI.md). |
| `DebugOptions` de `~/framework/modules/debug` | `debug` | Importé par le template `platforms` ; reste jusqu'à la migration de `debug` (vague 2). |
| Transport : refresh impossible → `logout` | — | **Tâche indépendante** (voir [STATUS.md](STATUS.md), chantiers transverses). `TODO(auth-migration)` dans `src/framework/util/transport/fetch.ts`. |
| Tests des flows | doc du service | Reporté (décision utilisateur). |
| Documentation | — | À écrire dans `.claude/docs/`. |

## 4. Décisions clés

- Passer des **noms** de plateforme ; `appConf.assertPlatformOfName` / `getExpandedPlatform` le plus tard possible.
- Vocabulaire : « active » (compte actif), jamais « activate » (confusion avec l'activation de compte) ; `sleep` = garder les jetons, notifications coupées.
- Le sign-in ne sait pas s'il ajoute ou remplace un compte : l'écran hôte passe `onSignedIn` par `SignInContext`.
- `restoreAccount` ne lève jamais : en cas d'échec il pose le statut de restauration et met la session en veille.
- Les écrans ont été **portés tels quels** (mêmes composants, classes comprises) : la qualité s'améliore par l'assainissement (§5).
- Accès aux modules : React d'abord + injection (`useModules()` → `createSessionLifecycle`), **pas de registre statique**, pas de synchronisation par observation de store.
- Imité pour les façades, l'API publique et les templates ; **pas** pour ses stores zustand ni ses flows (pas de passage à zustand, hors des deux skills).

## 5. Assainissement

Revue du 2026-11-19 face aux règles de `/migrate-module` et `/sanitize-module`, décisions du développeur le même jour.

### Fait (2026-11-19, non commité)

| Sujet | Ce qui a changé |
| --- | --- |
| Geste 10 (`useConfirmRemove`) | `usePreventBack` → `useConfirmRemove` dans les templates `verify-email` et `verify-mobile`. |
| `ui` | Template `mfa` : timers nettoyés au démontage (renvoi du code, vérification, redirection) ; **bug corrigé** : pour `email` / `mobile`, `onVerified` était appelé deux fois (timer de redirection **et** fin de l'animation) ; la fin de l'animation ne redirige plus que pour `mfa`. Changement visible : plus de double mise à jour du profil / double rafraîchissement des requirements. |
| `structure` (service) | `service/types.ts` en `namespace API`. Formats identiques au modèle déplacés dans `model/index.ts` et aliasés (`IUserRequirements`, `IEntcore*Validation{Infos,State}`, `IAuthorizedAction`, `UserRelative`, `ForgotResponse`) ; `SignInResult` (résultat du service, pas un format du backend) dans le modèle. Le modèle n'importe plus `service/types.ts` ni le template d'activation (`ActivationEmailState`, `ActivationMobileState` dans le modèle). |
| `api-publique` | `sign-in/use-sign-in.ts` → `sign-in/hooks.ts` ; `hooks/remove-account.ts` (interne) → `screens/hooks.ts` ; `account-list` retiré de `components/index.ts`. `PictureCard` déplacé de `src/framework/modules/auth/components/picture-card` vers `src/modules/auth/sign-in/components/picture-card` (seul utilisateur : le template `platforms`). |
| `dette` | `PageView` → `View` (template `introduction`) ; `KeyboardPageView` → `KeyboardAvoidingView` + `ScrollView` (+ `SafeAreaView` pour `forgot`), même structure qu'avant (templates `forgot`, `change-password`) ; `media-deprecated` et la façade `~/framework/modules/media` → `~/modules/media/components` / `util` (`discovery-class`, `redirect`, `welcome`, `wayf`). Façades sans importeur supprimées : `src/framework/modules/auth/model/business.ts`, `model/error.ts` (le seul importeur interne, l'ancien `templates/change-password`, lit `~/modules/auth/model/error`). |
| `styles` | `StyleSheet.create` de `components/accounts-button/large-button.tsx` → `styles.ts` voisin (valeurs inchangées). Le « style en ligne » de `templates/change-password/screen.tsx` est dans un bloc commenté : rien à faire. |

Vérifié le 2026-11-19 : `tsc` 770 erreurs, identiques par fichier et par code (les 2 TS2540 de `PictureCard` suivent le fichier déplacé) ; ESLint des deux dossiers : 1 erreur, préexistante (`src/framework/modules/auth/screens/mfa/styles.ts`) ; Jest 447/447 ; `yarn migration-status --check` vert. **Pas testé dans l'app.**

Recette : MFA par e-mail et par mobile (`user` → modifier l'e-mail / le mobile) et requirement « vérifier l'e-mail / le mobile » : une seule redirection après le bon code ; quitter l'écran avec une saisie en cours demande confirmation, y compris par le geste de retour ; écrans « mot de passe oublié », « identifiant oublié », introduction de l'ajout de compte, changement de mot de passe (requirement et renouvellement) : clavier, défilement, marge du bas sur iOS (le `SafeAreaView` interne est gardé pour `forgot`, pas ajouté ailleurs) ; images de `discovery-class`, `redirect`, onboarding (`welcome`) : affichées (le pont `Image` montre un placeholder pendant le chargement) ; bouton « Ajouter un compte » (`LargeButton`) inchangé.

### Backlog

- `structure` (modèle) : `model/business.ts` lit `useAccountsStore` (`userCanAddAccount`) : la règle n'est pas pure ; lui passer les comptes en paramètre (et adapter `business.test.ts`). Non décidé.
- `dette` : marqueurs `TODO(auth-migration)` (`src/framework/util/transport/fetch.ts`, `src/framework/modules/auth/thunks.ts`) et `ToDo:` sans module (`src/modules/auth/index.ts`, scopes `infra` / `userinfo`) : laissés tels quels (décidé le 2026-11-19).
- `dette` : bloc commenté (bouton « refuser et se déconnecter ») dans `templates/change-password/screen.tsx`.
- `styles` : `LargeButton` garde des valeurs sans équivalent exact (`elevation: 4`, ombre) et `theme.ui` (non touché, DESIGN-SYSTEM).

### Noté, non traité

- `erreurs` : ne pas toucher (décidé le 2026-11-19). 2 TS2540 dans `sign-in/components/picture-card/component.tsx` ; les erreurs des anciens écrans de `user` dans `src/framework/modules/auth` partent avec eux.
- `classes` (`SignInWayfScreenTemplate`, `ActivationScreen`) et `temporal` (`moment` dans `model/index.ts` et `service/adapter.ts`) : reportés ([later.md](later.md)).
- Appels à `Trackers` (`tracking.ts`, `wayf`, `discovery-class`, `service/index.ts`, `flows/start-session.ts`) : en attente de la décision Firebase ([later.md](later.md)).

## 6. Décisions

- 2026-11-19 : l'import de `~/app/navigation/types` reste jusqu'au **nettoyage final**, après toutes les migrations ([later.md](later.md)).
- 2026-11-19 : `headerTitle: () => ''` permis pour masquer le titre (`title: ''` affiche le nom de la route) ; règle générale dans CONVENTIONS « UI ».
- 2026-11-19 : `namespace API` = formats reçus du / envoyés au backend ; un format identique au modèle est écrit dans le modèle et aliasé par `API` ; règle générale dans CONVENTIONS « Structure d'un module ».
- 2026-11-19 : marqueurs `TODO(auth-migration)` laissés tels quels ; erreurs `tsc` / ESLint non traitées ; classes et `moment` reportés.

## 9. Assainissement : sujets

| Sujet | Statut | Remarque |
| --- | --- | --- |
| `connect` | sans objet | pas de `connect(` dans `src/modules/auth` |
| `try-action` | sans objet | — |
| `classes` | abandonné | reporté, à reprendre : [later.md](later.md) |
| `structure` (service) | fait | 2026-11-19 |
| `structure` (modèle) | à faire | `model/business.ts` lit le store (backlog) |
| `performance` | à faire | non relevé |
| `styles` | fait | 2026-11-19 |
| `dette` | fait | 2026-11-19 ; reste le backlog |
| `erreurs` | abandonné | décidé le 2026-11-19 |
| `api-publique` | fait | 2026-11-19 |
| `ui` | fait | 2026-11-19 (template `mfa`) |
| `temporal` | abandonné | reporté, à reprendre : [later.md](later.md) |
| `droits` | sans objet | `CoreModule`, toujours présent |
