# Migration : `user`

> Statut : **reporté** (plan en attente de validation ; phase 0 faite à part) — mis à jour le 2026-11-17

Les règles communes à toute la migration sont dans [CONVENTIONS.md](../CONVENTIONS.md) et ne sont pas répétées ici.

## 1. Périmètre

« Mon compte » : l'accueil du compte (avatar, profil, configuration, aide, mentions légales, version, déconnexion), la fiche de profil (la sienne ou celle d'un autre utilisateur), son édition (description, humeur / devise, centres d'intérêt, avatar), et les écrans de modification du mot de passe, de l'email, du mobile et de la langue.

`src/framework/modules/user` (~4 300 lignes, `NavigableModule`, non chargé) → `src/modules/user` (déjà déclaré en `EntModule`, seulement un accueil provisoire : comptes + déconnexion), décidé le 2026-11-17.

**Dans le périmètre**

- Accueil `user` : tout le contenu de `screens/home/screen.tsx`.
- Profil `user/profile` (le sien ou celui de `userId`), `user/profile/structures`, les trois écrans d'édition.
- Mot de passe, email, mobile (avec MFA préalable si la plateforme l'exige) : sur les **templates** de `src/modules/auth/templates/` (`change-password`, `verify-email`, `verify-mobile`, `mfa`), faits pour ça (voir [auth.md](auth.md)).
- Langue, mentions légales, « Qui sommes-nous ».
- **Un point d'extension** : un autre module ajoute un lien dans l'accueil (demande du 2026-11-16). Premier usage prévu : le futur écran de gestion des notifications push, déclaré par le module `notifications`. Forme : `entries.userMenu` (§5.3).

**Hors périmètre**

- **Écrans des notifications push** (demande du 2026-11-16) : `PushNotifsTopicsListScreen`, `PushNotifsItemsListScreen` (routes `user/notifPrefs`, `user/notifPrefs/details`) et le brouillon `screens/notif-prefs/`. Ils seront refaits dans le module `notifications`, qui ajoutera son lien par le point d'extension. Supprimés au nettoyage (décision du 2026-11-17 : le code reste dans git).
- Le lien « Notifications » de l'accueil n'est donc pas porté en dur : il reviendra par le point d'extension.

**Fonctionnalités faciles à oublier** (détail en §3)

- Accueil : décor SVG courbe sous le header (`userpage-header`) qui défile avec la page ; détails de version au **appui long** sur le numéro de version (et options de debug si `appConf.isDebugEnabled`) ; alerte « heures calmes » des notifications (`/userbook/api/preferences`) ; centre d'aide Zendesk initialisé à l'ouverture ; lien « splashads » seulement le jour où une pub a été montrée ; mot de passe masqué pour une connexion fédérée (`WAYF_SAML`).
- Email / mobile : le contexte d'auth de la plateforme est chargé une fois, la MFA passe avant si `needMfa` ; le bouton tapé montre un chargement et désactive les autres ; on ne navigue que si l'écran a encore le focus.
- Profil : membres de la famille dédoublonnés par nom normalisé ; règles d'affichage selon le type du lecteur et du profil ; résumé « Établissement + n structures » ; appel direct sur iOS, par une sheet sur Android ; humeur avant la famille en 1ᵈ, après « À propos » en 2ᵈ ; humeur / devise soumise au droit `userBookMottoMood` sur son propre profil.

## 2. Existant

### 2.1 Module ancien (`src/framework/modules/user`)

| Fichier / dossier                                    | Contenu                                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-config.ts`                                   | `HIDDEN_MODULE`, `entcoreScope: []`, `entcoreTrackingName: 'MyAccount'`, `hasRight: () => true`, `matchEntcoreApp: 'Directory'`, `testID: 'tabbar-account'`, `fileManager.avatar` (image, une seule, caméra / galerie).          |
| `index.ts`, `notif-handler.ts`                       | `NavigableModule` ; `registerNotifHandlers([])` (vide).                                                                                                                                                                          |
| `navigation/`                                        | `userRouteNames` (non kebab : `profile/editDescription`…) ; références à des routes qui n'existent plus (`accountOnboarding`, `space`) : ne compile pas.                                                                         |
| `reducer/`, `storage.ts`, `model/rights.ts`          | Vides (gabarits du scaffolder).                                                                                                                                                                                                  |
| `actions/index.ts`                                   | `profileUpdateAction` : filtre les clés, `PUT /directory/user/{id}` (ou `/directory/userbook/{id}` + `picture` pour l'avatar), met à jour la session (`authActions.profileUpdate`), rafraîchit l'avatar. Avale les erreurs.      |
| `service/index.ts`                                   | `userService.person` : `get` (`/userbook/api/person[?id=]`), `put` (`/directory/userbook/{id}`), `editHealthVisibility`, `getUserPreferences` (`/userbook/api/preferences`) ; `infoPersonAdapter` (ordre des hobbies, `moment`). |
| `model/index.ts`, `rights.ts`                        | `InfoPerson`, `HobbieItem`, `HobbieVisibility` ; droit `userBookMottoMood`.                                                                                                                                                      |
| `screens/home/`                                      | Accueil (604 lignes, `connect`, 7 hooks `use*Feature`). `types.ts` : `ModificationType` (importé par l'ancienne auth).                                                                                                           |
| `screens/profile/`                                   | Profil (609 lignes, `connect`, `ContentLoader`, `CustomBottomSheetModal`) ; `index.ts` : `hobbiesItems`, `renderEmoji`. Sous-dossiers `structures`, `edit-description`, `edit-hobbies`, `edit-moodmotto` (`renderMoodPicture`).  |
| `screens/change-password.tsx`                        | Sur l'**ancien** template `framework/modules/auth/templates/change-password` + flow `changePassword` du nouveau.                                                                                                                 |
| `screens/lang`, `legal-notice`, `who-are-we`         | Langue (`OldStorageFunctions`), mentions légales (ancienne auth redux, `openPDFReader`), « Qui sommes-nous » (Lottie, `react-native-rate`, `media-deprecated`).                                                                  |
| `screens/space`, `account-onboarding`, `notif-prefs` | **Orphelins** : hors du navigator, aucun importeur.                                                                                                                                                                              |
| `components/`                                        | `UserCard` (avatar + `BottomMenu` caméra / galerie, bouton « Envoyer un message »), `UserPlaceholderProfile` (skeleton), `BottomRoundDecoration`.                                                                                |

Le navigator déclare aussi les **anciens écrans d'auth** `framework/modules/auth/screens/change-email`, `change-mobile`, `mfa` (routes `user/change-email`, `user/change-mobile`, `auth/mfa-modal`).

### 2.2 Module nouveau (`src/modules/user`)

`index.ts` : `EntModule` `user`, écran `user` seul. `screens/home.tsx` : `AccountsButton` + bouton de déconnexion (`useAuthFlows().confirmLogout`), libellé en dur « Se déconnecter ». Chargé (`src/app/config/modules.ts`). On y arrive par l'avatar du header (`navigation.navigate('user')`, `src/app/test/amodule.tsx`).

### 2.3 Consommateurs externes

| Consommateur                                                                      | Importe                                        | Cible                                                                                                            |
| --------------------------------------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `framework/modules/timeline/screens/timeline-screen.tsx`, `mails/screens/details` | `userRouteNames.profile` (`{ userId }`)        | Anciens, non chargés : façade `@deprecated` (route `user/profile` inchangée).                                    |
| `framework/modules/timeline/components/notification`                              | `renderMoodPicture`                            | Ancien, non chargé : façade.                                                                                     |
| `framework/util/appConf.ts`                                                       | `WhoAreWellustrationType`, `WhoAreWeQuoteType` | **Chargé** : chemin inchangé ou façade.                                                                          |
| `framework/modules/auth/screens/change-email`, `change-mobile`, `mfa`             | `ModificationType`, `profileUpdateAction`      | Anciens écrans, remplacés ici par les templates : morts après la migration (retrait de l'ancienne auth, STATUS). |
| `src/app/override/modules.ts`, `__overrides__/*/modules.ts` (11)                  | `require('~/framework/modules/user')`          | Ancien registre, plus importé. Voir phase 8.                                                                     |

### 2.4 Dépendances transverses

| Dépendance                                                                                                                             | État                                                            | Piste                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `~/framework/modules/auth/*` (session, `logoutAction`, `platformConfig`, `requirements`, `mfaValidation`, legal urls, `profileUpdate`) | Façades `@deprecated`                                           | Nouvelle API : `useSession`, `useAuthFlows` (`confirmLogout`, `changePassword`), `usePlatformContext`, `usePlatformLegalUrls`, `service` de `~/modules/auth`, `useAccountsStore().updateProfile`. `logoutAction` lève une erreur. |
| Templates `src/modules/auth/templates/*`                                                                                               | Migré                                                           | Écrans email / mobile / MFA / mot de passe.                                                                                                                                                                                       |
| `~/app/navigation`, `navBarOptions`, `NavBarAction`, `usePreventBack`                                                                  | Ancien                                                          | `defineScreen` / `defineModal`, `headerRightActions`, `useConfirmRemove`.                                                                                                                                                         |
| `CustomBottomSheetModal`, `BottomMenu`                                                                                                 | Conversion imposée                                              | Écrans `formSheet` (un par contenu).                                                                                                                                                                                              |
| `~/framework/util/media-deprecated` (`Image`, `formatSource`)                                                                          | Interdit                                                        | `Image` de `~/modules/media/components`.                                                                                                                                                                                          |
| `openPDFReader`                                                                                                                        | Ancien                                                          | `useOpenMedia().openPdf`.                                                                                                                                                                                                         |
| `fileManager` de la config (`cameraActionFm` / `galleryActionFm`)                                                                      | **Absent** du nouveau système                                   | Clé `fileManager` de `ModuleConfig` (phase 0).                                                                                                                                                                                    |
| `workspaceService.file.uploadFile` (upload de l'avatar)                                                                                | Ancien (`workspace` à faire)                                    | Utilisé tel quel, `ToDo(user-migration)`.                                                                                                                                                                                         |
| `mails` (« Envoyer un message » : route `mails/edit`, `mailsService`)                                                                  | Ancien, non chargé                                              | Bouton masqué, sheet non portée (`ToDo` + later.md).                                                                                                                                                                              |
| `DebugOptions`, `ModalsRouteNames.SplashAds` (`debug`, `splashads`)                                                                    | Anciennes modales, absentes                                     | **Préalables** : `debug` et `splashads` migrés avant l'accueil (phase 0 bis).                                                                                                                                                     |
| `~/ui/avatars/Avatar` (+ `refreshSelfAvatarUniqueKey`)                                                                                 | Ancien composant partagé (6 importeurs, sur `media-deprecated`) | Gardé tel quel (§4 n° 9).                                                                                                                                                                                                         |
| `useZendesk`, `appConf`, `ContentLoader`, `DropdownPicker`, `OldStorageFunctions` (clés i18n)                                          | Utilitaires du framework                                        | Tels quels.                                                                                                                                                                                                                       |
| `moment` (`birthdate`)                                                                                                                 | —                                                               | `Temporal.PlainDate` (`@js-temporal/polyfill`, comme `media`).                                                                                                                                                                    |
| Point d'extension « lien dans l'accueil »                                                                                              | **Absent**                                                      | `entries.userMenu` (phase 0, §5.3).                                                                                                                                                                                               |

## 3. Comportements à conserver

**Accueil (`user`)**

- Avatar (taille `xxl`, URL de la session + `uti=logTimestamp`), nom, type de profil coloré (`theme.color.profileTypes`), bouton « Ma fiche » → profil.
- Alerte « heures calmes » si `quietHours.enabled` (`/userbook/api/preferences`, rechargée quand la session change, erreur = pas d'alerte).
- Section « Configuration » : mot de passe (pas si `WAYF_SAML`), email, mobile, langue. Section « Autres » : aide (si `zendeskHelpCenterEnabled`), « Qui sommes-nous » (si `whoAreWeEnabled`, icône `whoAreWe.icon`), splashads (si montrée aujourd'hui), mentions légales.
- Email / mobile / mot de passe : contexte d'auth chargé une fois (mis en cache), état MFA (`requirements.getState` → `needMfa` → `mfaValidation.getValidationState`) pour email et mobile ; MFA d'abord si besoin, puis l'écran de modification ; chargement sur la ligne tapée, autres lignes désactivées ; navigation seulement si l'écran a le focus ; toast `user-page-error-text` en cas d'échec.
- Après email / mobile modifiés : profil de la session mis à jour, retour à l'accueil, toast `auth-change-email-edit-toast` / `auth-change-mobile-edit-toast`.
- Zendesk : health check, thème, identité anonyme, locale `fr` à l'ouverture ; ouverture du centre d'aide sur `appConf.zendeskSections`.
- Comptes (`AccountsButton`), déconnexion avec confirmation.
- Version : appui long → détails (type, build, override, plateforme, OS, modèle) ou `DebugOptions` si debug ; défilement en bas après l'affichage.

**Profil (`user/profile`)**

- Le sien (pas de `userId`, ou le sien) ou celui d'un autre ; titre `user-profile-appname` / `user-profile-appname-externe`.
- Chargement avec skeleton (`UserPlaceholderProfile`), erreur → `EmptyConnectionScreen`.
- Famille : dédoublonnée (nom normalisé, sinon id) ; affichée pour un élève ou un parent, pas pour un élève qui regarde un autre élève ou un parent ; membre cliquable (→ son profil) pour un enseignant / personnel sur le profil d'un autre, ou un parent sur le sien.
- Structures et classes : première + « + n structures / classes » ; tap → `user/profile/structures` s'il y en a plusieurs.
- Infos personnelles (seulement sur le sien, ou si l'autre en a) : anniversaire (`D MMMM Y`), email (copie par sheet), téléphone / mobile (appel direct iOS, sheet Android).
- « À propos » (`health`, visibilité `SHOW_HEALTH`), humeur / devise (images 1ᵈ / 2ᵈ, droit sur son profil), centres d'intérêt (ordre fixe `animals, books, cinema, music, places, sport`, emojis, ligne « non renseigné »).
- Avatar (sien) : changer (caméra frontale ou galerie, upload workspace puis `PUT /directory/userbook/{id}` `picture`), supprimer ; chargement pendant l'opération ; toast `user-profile-changeavatar-error-upload`.
- Envoyer un message (profil d'un autre, si `mailsService.visibles.get` est disponible) : choix élève / parents / les deux quand le profil est un élève avec famille et que le lecteur n'est pas élève.

**Édition** : bouton ✓ dans le header ; confirmation en quittant avec des modifications (`user-profile-preventremove-*`) ; toast de succès / erreur ; le profil montre la nouvelle valeur au retour. Description : visibilité publique / privée (`edit-user-info-visibility`). Humeur / devise : 11 humeurs, devise ≤ 75 caractères, alerte au premier focus de la devise. Centres d'intérêt : 6 champs, visibilité par champ, défilement vers le champ au clavier.

**Langue** : « auto » + langues triées (+ « clés » si `I18n.canShowKeys`), valeur lue dans les clés i18n du storage, confirmation, `I18n.changeLanguage` (redémarre) ou `toggleShowKeys`.

**Mentions légales** : URLs rechargées à chaque ouverture ; 4 documents ouverts dans le lecteur PDF.

**Qui sommes-nous** : illustration (animation / image), citation (2 styles), noter l'app (`react-native-rate`, `appleId`), bouton ENT web, bouton « découvrir ».

**testID** (E2E) : `account-user-image`, `account-username`, `account-profil-type`, `account-see-profil`, `account-configuration`, `account-notifications` (lien qui part dans `notifications`), `account-change-password`, `account-change-email`, `account-change-phone`, `account-change-language`, `account-others`, `account-help`, `account-who-are-we`, `account-legal`, `account-add-account`, `account-logout`, `account-version-number`, `account-push-notifications-alert` ; `legal-back`, `legal-title`, `legal-user-charter`, `legal-user-cgu`, `legal-user-data-protection`, `legal-cookies`.

**i18n** : clés `user-*` inchangées. Tracking : `entTrackingName: 'MyAccount'`.

## 4. Ancienneté de conception à corriger au passage

| #   | Constat                                                                                                                                       | Correction proposée                                                                                                                              | Statut             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | Sheets du profil (`CustomBottomSheetModal` : copier l'email, appeler, envoyer un message) et de `UserCard` (`BottomMenu` : caméra / galerie). | Un écran `formSheet` par contenu (`defineModal`), comme `myapps`.                                                                                | à faire au portage |
| 2   | Bouton ✓ par `navigation.setOptions` dans un effet ; `usePreventBack`.                                                                        | `headerRightActions` (`headerCustom` s'il lit l'état) ; `useConfirmRemove` (couvre aussi le geste de fermeture).                                 | à faire au portage |
| 3   | Titre du profil par `setOptions` dans un effet.                                                                                               | `options` de l'écran, d'après `route.params.userId`.                                                                                             | à faire au portage |
| 4   | Les écrans d'édition renvoient **toutes** les valeurs au profil par `navigate(profile, { new* }, { pop: true })`.                             | Store **zustand** des profils par id (`createSessionStore`) : l'édition écrit, le profil lit ; les éditions deviennent des modales (2026-11-17). | réglé par la cible |
| 5   | Routes non kebab (`user/profile/editDescription`, `user/notifPrefs`…).                                                                        | `user/profile/edit-description`, `edit-hobbies`, `edit-mood-motto` (CONVENTIONS). Les noms de la télémétrie changent.                            | à faire au portage |
| 6   | Écrans d'édition : sans modification, `goBack()` **puis** enregistre quand même (pas de `return`).                                            | Ajouter le `return`.                                                                                                                             | à valider          |
| 7   | Accueil : l'avatar n'est cliquable (→ profil) que s'il n'y a **pas** de photo (condition inversée ?).                                         | Toujours cliquable.                                                                                                                              | à valider          |
| 8   | `profileUpdateAction` avale les erreurs : le profil ne voit jamais l'échec de l'avatar.                                                       | L'action lève ; l'écran montre le toast.                                                                                                         | à valider          |
| 9   | `~/ui/avatars/Avatar` repose sur `media-deprecated` ; `SelfAvatar` du framework lit l'ancienne redux.                                         | Garder `Avatar` tel quel (chantier transverse « supprimer `media-deprecated` »).                                                                 | noté               |
| 10  | `hobbiesItems` vient d'un écran et est importé par le service (cycle).                                                                        | Dans `model/`.                                                                                                                                   | réglé par la cible |
| 11  | Variable `degre`, `moods` recréés à chaque rendu, `any`, `.bind(this)`.                                                                       | Rien (porter tel quel).                                                                                                                          | noté               |
| 12  | `setTimeout` pour défiler après l'affichage des détails de version / l'alerte de la devise.                                                   | Rien (pas de navigation en jeu).                                                                                                                 | noté               |

## 5. Cible

Décisions de §7 appliquées.

### 5.1 Config

```ts
export default new EntModule({
  name: 'user',
  scope: ['userbook', 'directory'], // /userbook/api/…, /directory/user…  (déjà demandés par auth, ToDo dans auth)
  entries: { myApps: { route: 'user' } }, // ouvert par l'avatar du header et `useOpenModule` ; pas d'onglet
  entTrackingName: 'MyAccount',
  screens: { user, 'user/profile', 'user/change-email', 'user/change-mobile', 'user/lang', 'user/legal-notice', … },
  modals:  { 'user/profile/edit-*', 'user/profile/structures', 'user/who-are-we', 'user/change-password', sheets… },
  fileManager: { avatar: { allow: ['image'], multiple: false, sources: ['camera', 'gallery'] } }, // nouvelle clé (phase 0)
});
```

Pas de clé `redux` : le store des profils est un store zustand vidé en fin de session (`createSessionStore`, §5.2), sans déclaration dans la config.

Pas de droits (`hasRight: () => true` de l'ancien = toujours disponible ; un `EntModule` sans condition l'est aussi). Pas d'onglet. Pas de hook de session (rien à charger à la connexion). `storage.ts` (namespace `user`, vide, sans migration) : gardé, non déclaré.

### 5.2 Structure

Celle de `myapps` (CONVENTIONS « Structure d'un module ») :

- `model/` : `index.ts` (`InfoPerson`, `HobbieItem`… ; `birthdate` en `Temporal.PlainDate`), `profile.ts` (règles : ordre des hobbies, famille dédoublonnée, qui voit quoi, résumés structures / classes), `rights.ts` (humeur / devise).
- `service/` : `types.ts` (`namespace API`), `adapter.ts`, `index.ts` (`getModuleTransport('user')`).
- `store/` : store **zustand** `createSessionStore` (`~/modules/auth/store/session`, vidé à la fin de chaque session), profils par id, comme les stores de `auth` (`State` / `Action`, hook sélecteur + getter non React).
- `actions.ts` : charger un profil, enregistrer description / humeur / hobbies, changer / supprimer l'avatar, mettre à jour email / mobile dans la session.
- `screens/` : chemins actuels gardés autant que possible ; écrans email / mobile / MFA nouveaux (sur les templates).
- `components/` : `UserCard`, `UserPlaceholderProfile`, `BottomRoundDecoration`, liens de l'accueil.

### 5.3 Points d'entrée : `entries` (phase 0)

Décidé le 2026-11-17 (§7). `ModuleConfig.entry` et `ModuleConfig.tab` sont remplacés par un objet facultatif `entries` :

```ts
entries?: {
  myApps?: { route };                                                    // ex-`entry` : « Mes applis », `useOpenModule`
  tab?: { route; iconActive; iconInactive; order?; testId; labelI18n? }; // ex-`tab`
  userMenu?: {                                                           // liens dans l'accueil de `user`
    route; labelI18n; icon: SvgIconName; testID; section: 'configuration' | 'others'; order?;
  }[];
  // create : prévue, ajoutée quand elle aura un consommateur
};
```

- `route` est **obligatoire** dans chaque entrée (et chaque lien de `userMenu`) et typée `EntryRoute<Screens>` : un écran du module sans params obligatoires. Plus d'héritage `tab.route` ← `entry` : `myapps` écrit sa route deux fois.
- `useOpenModule` / `useCanOpenModule` / `AllModulesWithEntryNames` : un module s'ouvre s'il a `entries.myApps` (onglet s'il en a un, sinon `myApps.route`), comme aujourd'hui avec `entry`.
- `user` lit les `userMenu` des **modules disponibles** (`useUserAvailableModules()`), les range dans leur section, triés par `order`, avant ses propres lignes. Le module qui déclare un lien ne dépend pas de `user`, et `user` ne connaît pas `notifications`.
- Exemple (plus tard, module `notifications`) : `userMenu: [{ route: 'notifications/push-settings', labelI18n: 'user-pushnotifssettings-title', icon: 'ui-notif', testID: 'account-notifications', section: 'configuration' }]`.
- Touché en phase 0 : `src/app/module/types.ts` et `index.tsx` (`Module`, paramètre de type `Entry` → les routes d'`entries`), `loader.tsx` (`useTabModules`), `src/app/navigation-new/tabs.tsx`, `open-module.ts`, `src/modules/myapps/index.ts` et `hooks/apps.ts`, modules de test `src/app/test/*`, ancien `src/app/navigation/main-navigation.tsx` (type `TabModule`) ; doc ARCHITECTURE §2.3 et §3.2, [myapps.md](myapps.md), STATUS (décision du 2026-11-04 « route d'entrée = clé `entry` » remplacée).

### 5.4 Façades `@deprecated`

Aux anciens chemins encore importés : `navigation/index.ts` (`userRouteNames`), `screens/profile/edit-moodmotto` (`renderMoodPicture`), `screens/who-are-we` (types de `appConf`, ou `appConf` passe au nouveau chemin), `screens/home/types` (`ModificationType`) et `actions` (`profileUpdateAction`) tant que les anciens écrans d'auth existent.

## 6. Plan par phases

| #     | Phase                              | Contenu                                                                                                                                                                                                                                                                                                                    | Vérification                                             |
| ----- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| 0     | Préalables du framework (**fait**) | `entries` (§5.3) : types, `Module`, onglets, `useOpenModule`, `myapps`, modules de test ; clé `fileManager` remplie par le chargement des modules. Doc ARCHITECTURE §2.3, §3.2.                                                                                                                                            | tsc, eslint, tests (filtre / tri des liens)              |
| 0 bis | Préalables : `debug`, `splashads`  | Migrer `debug` (modales Infos / Log / Network, `DebugOptions`) et `splashads` (modale SplashAds, affichage à la connexion) : chacun sa fiche (`/migrate-module`), dans cette session ou une autre. Bloque seulement les lignes debug / splashads de l'accueil (phase 5).                                                   | selon leurs fiches                                       |
| 1     | Déplacements                       | `git mv` de `framework/modules/user/{screens,components,model,service,rights.ts,storage.ts}` vers `src/modules/user/` (sauf écrans de notifications et orphelins), chemins d'import ajustés à l'identique. L'accueil provisoire `screens/home.tsx` reste jusqu'à la phase 5. À committer seul.                             | tsc : même nombre d'erreurs                              |
| 2     | Données                            | `model/` (types + règles), `service/` (`types.ts`, `adapter.ts`, `getModuleTransport('user')`), `store/`, `actions.ts`. Tests Jest des règles et de l'adapter.                                                                                                                                                               | tsc, eslint, `yarn test`                                 |
| 3     | Déclaration                        | `index.ts` : `scope`, `entries`, `entTrackingName`, `fileManager`.                                                                                                                                                                                                                                                         | tsc ; l'accueil provisoire s'ouvre toujours (dans l'app) |
| 4     | Façades                            | Façades `@deprecated` (§5.4), `appConf` sur le nouveau chemin.                                                                                                                                                                                                                                                             | tsc, aucun import cassé                                  |
| 5     | Écrans                             | `defineScreen` : accueil (remplace `home.tsx`, liens `entries.userMenu`, `confirmLogout`, alerte « heures calmes », debug / splashads des modules migrés en 0 bis), profil, langue, mentions légales (`usePlatformLegalUrls`, `openPdf`), email / mobile / MFA (templates `auth`). Header par options, `testID` conservés. | parcours dans l'app                                      |
| 6     | Modales                            | `defineModal` : édition (×3, `useConfirmRemove`, ✓ dans le header), structures, « Qui sommes-nous », mot de passe (template), sheets `formSheet` (email, appel Android, avatar).                                                                                                                                           | parcours dans l'app                                      |
| 7     | Points reportés                    | `ToDo(user-migration)` + [later.md](later.md) : envoyer un message (mails), upload par `workspace`, lien des notifications (par `entries.userMenu` du module `notifications`).                                                                                                                                             | `grep -rn "ToDo(user-migration)" src`                    |
| 8     | Nettoyage                          | Suppression de l'ancien `module-config.ts`, `index.ts`, `navigation/`, `reducer/`, `actions/` (si plus importé), `notif-handler.ts`, des écrans de notifications et des orphelins (tous supprimés), des façades sans importeur. Les listes `__overrides__/*/modules.ts` (fichiers overridés) : à décider à ce moment.      | `grep -rn "framework/modules/user"`                      |

## 7. Décisions

- 2026-11-16 (utilisateur) : les écrans des notifications push ne sont pas migrés ici ; `user` offre un point d'extension pour qu'un autre module ajoute un lien dans son accueil (premier usage : le futur écran de gestion des push, déclaré par `notifications`).
- 2026-11-17 (utilisateur) : **clé de config**. Les points d'entrée d'un module sont regroupés dans un objet facultatif `entries` de `ModuleConfig`, aux clés facultatives `myApps` (remplace `entry`), `tab` (remplace `tab`), `userMenu` (nouveau : liens dans l'accueil de `user`) et `create` (futur). Chaque entrée a au moins une `route`, plus ses champs propres, fortement typés. Raison : les points d'entrée se multiplient, il faut les rassembler. Fait en phase 0 (touche `myapps` et les modules de test). Détail en §5.3.
- 2026-11-17 (utilisateur) : la `route` de chaque entrée est **obligatoire** (plus d'héritage `tab.route` ← `entry`) et typée **sans params obligatoires** (`EntryRoute<Screens>`), pour toutes les entrées. Raison : explicite, et toute entrée s'ouvre sans params.
- 2026-11-17 (utilisateur) : `create` n'est pas déclarée en phase 0 ; elle sera ajoutée avec son premier consommateur.
- 2026-11-17 (utilisateur) : `userMenu` est un **tableau** de liens (un module peut en ajouter plusieurs). Champs de chaque lien (`route`, `labelI18n`, `icon`, `testID`, `section`, `order?`) : proposition de §5.3, à confirmer à la relecture de la phase 0.
- 2026-11-17 (utilisateur) : **emplacement `src/modules/user`** (déjà commencé là), fichiers déplacés par `git mv` dans une phase à part.
- 2026-11-17 (utilisateur) : **store des profils** (par id) ; les écrans d'édition l'écrivent et deviennent des modales. Raison : plus de valeurs renvoyées par params.
- 2026-11-17 (utilisateur, à la relecture) : ce store est **zustand** (`createSessionStore`), pas Redux. Raison : ancienneté de conception corrigée au passage. Exception assumée à `modules-de-reference.md` (« imiter `auth` pas pour zustand, sauf décision ») ; l'ancien reducer de `user` n'a aucun importeur externe, rien à garder côté Redux.
- 2026-11-17 (utilisateur) : **clé `fileManager`** dans `ModuleConfig`, enregistrée au chargement des modules (phase 0). Raison : servira aux autres modules (`workspace`, `blog`, `mails`…).
- 2026-11-17 (utilisateur) : alerte « heures calmes » **portée dans `user`**.
- 2026-11-17 (utilisateur) : « Envoyer un message » **masqué, non porté** tant que `mails` n'est pas migré (`ToDo` + later.md).
- 2026-11-17 (utilisateur) : **`debug` et `splashads` migrés d'abord** (préalables, phase 0 bis), plutôt que masqués. Ensuite (règle « Modules préalables » du skill) : gardés en **phase 0 bis** de ce plan, sans arrêter la migration (deux petits modules).
- 2026-11-17 (utilisateur) : `birthdate` en **`Temporal`** (`Temporal.PlainDate`), comme `media`. Le format affiché (`D MMMM Y` avec `moment`) est à reproduire avec la locale de l'app.
- 2026-11-17 (utilisateur) : au nettoyage, **tout supprimer** : écrans des notifications push (`PushNotifs*`, `notif-prefs`) et orphelins (`space`, `account-onboarding`). Le code reste dans git pour `notifications`.
- 2026-11-16 (règle) : email / mobile / MFA / mot de passe sur les templates de `src/modules/auth/templates/` (un module migré n'utilise pas les façades, et ces templates ont été faits pour `user`).

## 8. Questions ouvertes

Aucune (toutes tranchées le 2026-11-17, voir §7). À confirmer à la relecture de la phase 0 : les champs d'un lien `userMenu` (§5.3).

## 9. Avancement

- 2026-11-17 : **migration de `user` reportée** (utilisateur) ; les évolutions du framework du plan sont faites tout de suite (phase 0) :
  - `entries` (§5.3) dans `src/app/module/types.ts` : `ConfigForEntries` (`myApps`, `tab`, `userMenu`), `ConfigForMyAppsEntry`, `ConfigForTabEntry` (ex-`ConfigForTab`), `ConfigForUserMenuEntry`, `UserMenuSection`. Paramètre de type `Entries` de `Module` / `CoreModule` / `EntModule` (ex-`Entry`) ; `module.entries` = l'objet donné (`{}` sans entrée). `ModuleTab` et la route héritée (`createTab`) supprimés. `ModuleEntries<T>`, `AllModulesWithMyAppsEntryNames` (ex-`AllModulesWithEntryNames`).
  - `userMenu` : `getUserMenuEntries(modules, section)` (`src/app/module/entries.ts`, testé) et `useUserMenuEntries(section)` (`hooks.tsx`) sur les modules disponibles ; type `UserMenuEntry` (le lien + `module`), `never` tant qu'aucun module n'en déclare. Champs proposés au §5.3, gardés tels quels.
  - Consommateurs : `useTabModules`, `tabs.tsx` (`getTabLabel(tab, appDisplay)`), `open-module.ts`, `myapps` (`index.ts`, `hooks/apps.ts`), modules de test (leurs écrans d'accueil n'ont plus de params, inutilisés ; `cmodule` / `emodule` : composants d'accueil et de modale remis à leur route), ancien `main-navigation.tsx` et brouillon `framework/modules/timeline/index.tsx` (déjà en erreur).
  - `fileManager` : clé de `ModuleConfig` (`IModuleFileManagerConfig`), enregistrée par `ModuleLoader` dans le registre de `FileManager.pick` (que plus rien ne remplissait depuis l'arrêt de `moduleTool.loadModules`).
  - Doc : ARCHITECTURE §2, §2.3, §3.2, §6 ; [myapps.md](myapps.md) §5 ; signaux du skill (`framework.md`).
  - Vérifié : tsc 776 (inchangé), eslint 2 090 erreurs / 88 warnings (inchangé), `yarn test` 431/431 (+3). Types vérifiés par un fichier de sonde (retiré) : route inconnue ou absente refusée, `amodule` non ouvrable, `UserMenuEntry` = `never`. **Pas testé dans l'app** (onglets, ouverture de « Mes applis »).
- 2026-11-17 : questions tranchées, `entries` décidé (§5.3), statut `en cours` ; plan en attente de validation.
- 2026-11-16 : analyse et plan (statut `spec`). Aucun code modifié. Base de vérification : tsc 776 erreurs (dont 39 dans `modules/user`), eslint 2 090 erreurs / 88 warnings, 428 tests (39 suites).
