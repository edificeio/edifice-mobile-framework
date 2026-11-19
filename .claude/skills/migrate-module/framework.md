# Dépendances transverses : état de migration

Le framework est en chantier. Pour chaque élément transverse dont dépend le module (composant, utilitaire, autre module, mécanisme de l'ancien système), **vérifier son état dans le code et dans [journal/STATUS.md](journal/STATUS.md)** : ne jamais supposer qu'il est migré, ni qu'il est figé. Fichier commun aux deux skills.

## Sources de vérité, dans l'ordre

1. Le code : le fichier existe-t-il dans le nouveau système ? Porte-t-il `@deprecated` ? Un `ToDo(<x>-migration)` ?
2. [journal/STATUS.md](journal/STATUS.md) (« Chantiers transverses », « Questions ouvertes ») et [journal/later.md](journal/later.md) (sujets à ne pas démarrer sans décision).
3. [.claude/docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md) §6 « Fonctionnalités de l'ancien système absentes du nouveau ».
4. Les fiches des modules concernés (`journal/<x>.md`, décisions et questions ouvertes).

La liste ci-dessous est un point de départ daté : la revérifier à chaque module.

## Catégories

**Pendant la bascule**, une seule question : l'élément marche-t-il dans la nouvelle navigation ? Oui : on le garde tel quel et, s'il est à améliorer, une ligne va dans §5 de la fiche. Non : c'est un geste de [BASCULE.md](BASCULE.md), ou une condition d'arrêt.

**Pendant l'assainissement**, les catégories servent à décider :

| Catégorie | Signe | Bascule | Assainissement |
| --- | --- | --- | --- |
| **Migré** | Nouveau système, sans `@deprecated` | L'utiliser quand un geste le demande. Lire son API dans le code | L'utiliser |
| **Façade `@deprecated`** | Ancien chemin qui lit le nouveau code | Garder, sauf `auth` (geste 14) | Passer à la nouvelle API. Si elle ne couvre pas le besoin : question |
| **Ancien, à migrer** | Module ou chantier `à faire` / `en cours` dans STATUS | Code seul : gardé avec `ToDo` (geste 16). Navigation ou state : arrêt, question : (A) le basculer d'abord (son propre `/migrate-module`) ; (B) masquer l'action avec un `ToDo` et `later.md` | Question : (A) attendre sa bascule ; (B) en sortir la partie utile dans le framework, dans un changement à part |
| **Absent du nouveau système** | ARCHITECTURE §6, ou rien de comparable dans `src/app/` / `src/modules/` | Arrêt, question : (A) reporter (`later.md` + `ToDo`, fonctionnalité absente en attendant) ; (B) concevoir l'évolution du framework, avant, à part ; (C) solution provisoire locale au module | Idem |
| **Candidat au framework** | Code du module générique, ou importé par d'autres modules | Rien : une ligne dans §5 | Question : (A) le remonter dans le framework (`src/framework/components`, `src/framework/util`, `src/app/…`) ; (B) l'exposer en API publique du module (`hooks/`, `components/`) ; (C) le laisser |
| **Framework pas sec** | API migrée qui ne couvre pas le besoin (option, typage, cas oublié) | Arrêt : l'évolution part avant, à part | Proposer l'évolution, en listant les autres utilisateurs de l'API (`grep`). Ne pas tordre le module autour en silence, ne pas changer l'API sans accord |

Format d'une question dans la fiche (« Questions ouvertes ») :

```md
N. **<sujet>** (`<chemin ou API>`, état : <catégorie>). <constat en une ou deux phrases>.

- A) … — conséquence.
- B) … — conséquence.
- Recommandation : <option> (<raison>).
```

## Signaux connus (à revérifier)

| À chercher dans le module | Ce que c'est, et la piste | Quand |
| --- | --- | --- |
| `~/framework/modules/auth` | Façades `@deprecated`. API publique : `~/modules/auth/hooks/*`, `hoc/*`, `components/*` ; getters (`~/modules/auth/store/accounts`), `flows`, `model` acceptés. **Jamais `~/modules/auth`** (index chargé en différé). Fiche [auth.md](journal/auth.md) | bascule (geste 14) |
| `~/app/navigation` (ancien), `headerAction`, `navBarOptions`, `computeNavBar`, `~/framework/navigation/*` | Ancienne navigation, remplacée par `~/app/navigation-new` (`defineScreen`, `defineModal`, `headerLeftActions` / `headerRightActions`). `navigate` de `~/framework/navigation/helper` passe par l'ancien `navigationRef`, plus branché. Modèles : `src/modules/myapps/screens/` | bascule (gestes 6, 9) |
| `navigation.setOptions` | Marche, mais son contenu ancien (`headerRight` avec `NavBarAction` / `PopupMenu`, `headerLeft`, `navBarOptions`) se convertit. Gardé seulement pour un bouton qui dépend de l'état, avec les nouveaux items | bascule (geste 8) |
| `usePreventBack` (`~/framework/hooks/prevent-back`) | `@deprecated`, appelle `useConfirmRemove` | bascule (geste 10) |
| `AllModules`, `moduleConfig.*` d'un autre module | Registre statique retiré (`AllModules()` renvoie `[]`) : `useModules()`, `useModule(name)`, `useModulesRecord()` (CONVENTIONS « Portage ») | bascule (geste 11) |
| `callAtLogin` | Déprécié : `sessionSetup` / `onSessionStart` (`src/app/module/types.ts`) | bascule (geste 12) |
| `getSession()` / `assertSession()` dans un écran, `sessionScreen` (`~/framework/components/screen`), `withSession` de `~/framework/modules/auth/util` | `withSession` de `~/modules/auth/hoc` : session garantie en prop, `AccountStorageProvider` pour les storages par compte. `sessionScreen` est l'ancien équivalent (`ScreenView` + `assertSession`), l'ancien chemin de `withSession` une façade | bascule (geste 18) |
| `tryAction`, `tryActionLegacy` (`@deprecated`), `handleAction` (`~/framework/util/redux/actions`) | Enveloppes de thunks : journal d'erreur, relance de l'erreur. Leur option `track` est **déjà sans effet** (`performAction` calcule l'événement sans l'envoyer, `tryActionLegacy` ignore `trackInfo`). À supprimer, sans appel de remplacement à `Trackers` (plus compatible avec la stack Firebase) | assainissement (`try-action`) |
| Styles en ligne, `StyleSheet.create` hors de `styles.ts` | Règle `.claude/rules/DESIGN-SYSTEM.md`, suspendue pour le code porté pendant la bascule (CONVENTIONS « Portage ») | assainissement (`styles`) |
| `displayAs: 'myAppsModule'`, `display*`, `displayBadges` | **Absents** de `ModuleConfig` (ARCHITECTURE §6). Ouvrir depuis « Mes applis » : `entries.myApps` ; onglet : `entries.tab` (libellé `labelI18n` ou l'app ENT) | bascule (geste 3) |
| Points d'entrée : `entry`, `tab` (API intermédiaire) | **`entries`** (fait le 2026-11-17, [user.md](journal/user.md) §5.3) : `myApps` (ex-`entry`), `tab`, `userMenu` (liens dans l'accueil de `user`, lus par `useUserMenuEntries`), `create` (plus tard, avec son premier consommateur). `route` obligatoire dans chaque entrée, sans params obligatoires, sans héritage | bascule (geste 3) |
| Un lien vers le module dans « Mon compte » (accueil de `user`) | `entries.userMenu` du module qui possède l'écran (tableau de liens). `user` ne connaît pas les autres modules | bascule (geste 3) |
| `fileManager` dans `module-config.ts` (`cameraActionFm`, `galleryActionFm`, `FileManager.pick`) | Clé `fileManager` de `ModuleConfig` (faite le 2026-11-17) : même forme que l'ancienne, enregistrée au chargement des modules dans le registre que lit `FileManager.pick({ module, usecase })` | bascule (geste 1) |
| `entcoreTrackingName` | `entTrackingName`, lu de la même façon par le tracker (`src/framework/util/tracker/index.ts`, `_init`) | bascule (geste 1) |
| Ancien storage, clés à la racine | `Storage.account` / `Storage.device` (`~/framework/util/storage`), déclarés dans `storages`, clés inchangées, migrations | bascule (geste 13) |
| Présence dans les `modules.ts` des marques (`src/app/override/modules.ts`, dépôt `edifice-mobile-config`) | Liste des modules **par marque** dans l'ancien système. Le nouveau registre n'est pas surchargé par marque : le module y est ajouté pour toutes les marques ([later.md](journal/later.md)). Pas de vérification | bascule (geste 17) |
| Navigation vers une route d'un module ancien (`mailsRouteNames.*`…) | La route n'existe pas dans la nouvelle navigation (module non chargé). Question ; pour `user` (« Envoyer un message » → `mails`) : action masquée, non portée, `ToDo` + `later.md` | bascule : arrêt |
| `ModalsRouteNames.*` (`~/framework/navigation/modals`) | Anciennes modales globales (Infos, Log, Network, SplashAds…), **absentes** du nouveau système. Question : basculer `debug` / `splashads` d'abord, ou masquer avec un `ToDo` | bascule : arrêt |
| `notif-handler.ts`, `registerNotifHandlers` | **Absent** du nouveau système. Question architecture n° 1 de STATUS (notifications vs `timeline`) : ne pas improviser | bascule : arrêt |
| `src/app/intents.ts` | Legacy, reporté ([later.md](journal/later.md)) | bascule : arrêt |
| Widgets / sections de l'accueil | Pas d'équivalent connu dans le nouveau système (un module `home` est évoqué dans [timeline.md](journal/timeline.md)) : question | bascule : arrêt |
| `~/framework/modules/audience` | Migré en partie seulement (STATUS, question ouverte n° 2) : composants et écrans de réactions encore anciens | selon l'usage |
| `~/framework/modules/myapps` | Supprimé. Affichage d'une app : `useEntAppDisplay`, `useModuleAppDisplay`, `EntAppImage`, `ModuleImage` ; ouvrir un module : `useOpenModule` | bascule (l'import casse) |
| `~/framework/util/media-deprecated`, `react-native-fast-image`, `-video`, `-pdf` | Interdits dans le code nouveau : composants ponts de `~/modules/media/components` (`Image`, `FastImage`, `Video`, `Pdf`) ; ouvrir un média : `useOpenMedia()`. Fiche [media.md](journal/media.md) | assainissement, sauf s'il ne marche plus |
| Anciens écrans d'auth (`framework/modules/auth/screens/change-*`, `mfa`, `templates/change-password`) | Templates de `src/modules/auth/templates/` (`change-password`, `verify-email`, `verify-mobile`, `mfa`), faits pour être réutilisés par props | assainissement |
| `CustomBottomSheetModal`, `@gorhom/bottom-sheet`, `BottomMenu`, `ModalBox`, `react-native-modal` | Conversions d'UI (CONVENTIONS « UI ») ; marchent dans la nouvelle navigation (`BottomSheetModalProvider` monté dans `src/app/navigation-new/index.tsx`) | assainissement |
| `moment` | `media` et `user` sont passés à `Temporal` (`@js-temporal/polyfill`) : le recommander, et noter le format d'affichage à reproduire | assainissement |
| Fonctions du transport sur des chemins du module | `getModuleTransport('<module>')` (`~/framework/util/transport/module-transport.ts`) | assainissement |
| `PageView`, `KeyboardPageView` (`~/framework/components/page`), `pageGutterSize` | `@deprecated`. Le layout de la nouvelle navigation donne déjà le fond, la taille et l'`ErrorBoundary` de l'écran. Remplacer `PageView` par un fragment, ou un `View` s'il faut un style ; `KeyboardPageView` par `KeyboardAvoidingView` (`~/framework/components/keyboard`) ; `pageGutterSize` par `UI_SIZES.spacing.medium` (décidé le 2026-11-19, modèle : `src/framework/modules/support/screens/create-ticket/screen.tsx`). `KeyboardPageView` ajoutait un `SafeAreaView` : vérifier dans l'app la marge du bas sur iOS | assainissement (`dette`) |
| `BottomMenu` (`~/framework/components/menus/bottom`) | Bottom sheet gorhom (`CustomBottomSheetModal`), 5 utilisateurs. **Modifie le tableau `actions` qu'il reçoit** (il y ajoute « Annuler » à chaque ouverture) : ne pas mémoïser ce tableau. Sa conversion en `formSheet` est un chantier du framework | assainissement (`performance`, `ui` : framework) |
| `LocalFile`, `SyncedFile`, `SyncedFileWithId` | Deux jeux de classes : `~/framework/util/fileHandler` (`index.ts`) et `~/framework/util/fileHandler/models`. `FileManager.pick` produit celles de `models`, `workspace` attend celles d'`index.ts` : d'où des TS2345. Importer `SyncedFileWithId` de `~/framework/util/fileHandler`. `nativeInfo` du `LocalFile` d'`index.ts` élargi le 2026-11-19 (corrige 4 erreurs, dont 1 de `support`) | assainissement (`erreurs`) |
| Composant d'un autre module ancien | Catégorie « Ancien, à migrer » ou « Candidat au framework » | selon la catégorie |
