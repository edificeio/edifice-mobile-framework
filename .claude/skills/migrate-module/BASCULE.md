# Patron de bascule d'un module

> L'étape 1 d'[INTENT.md](INTENT.md) : faire changer un module de génération sans toucher à son comportement ni à son code interne. Tiré de `support` ([support.md](journal/support.md)) et revu le 2026-11-19 avec le développeur. Suivi par le skill `/migrate-module` ; à corriger au fil des modules suivants.

## Avant de commencer

1. Lire [INTENT.md](INTENT.md), [CONVENTIONS.md](CONVENTIONS.md), la ligne du module dans [SUIVI.md](journal/SUIVI.md).
2. Créer la fiche du module depuis [\_template-bascule.md](journal/_template-bascule.md).
3. Flows Maestro du module : **recommandés, pas bloquants** ([.maestro/README.md](../../../.maestro/README.md)). Les écrire avant, les jouer sur un build de l'ancienne génération quand ses `testID` le permettent ; sinon écrire dans la fiche la recette manuelle qui les remplace.
4. Mesurer et garder les sorties, dans le scratchpad de la session (jamais dans le dépôt) : `yarn ts-all`, `npx eslint <dossier du module>`, `yarn test`, total de `yarn lint-all`. Pour comparer `tsc` fichier par fichier, compter les erreurs par fichier et par code, sans les numéros de ligne ni les messages (un message peut citer l'union de toutes les routes, qui change dès qu'une route est ajoutée ou renommée) :

   ```bash
   yarn ts-all 2>&1 | grep "error TS" | sed -E 's/^([^(]+)\([0-9]+,[0-9]+\): error (TS[0-9]+).*/\1 \2/' | sort | uniq -c > "$SCRATCHPAD/tsc-avant.txt"
   ```

## Les gestes

| # | Avant | Après |
| --- | --- | --- |
| 1 | `module-config.ts` : `new NavigableModuleConfig({ entcoreScope, entcoreTrackingName, fileManager, matchEntcoreApp, hasRight, name, storageName, display* })` | supprimé ; ses champs passent dans `index.ts` : `scope`, `entTrackingName`, `fileManager`, `matchEntcoreApp`, `name`. `hasRight({ matchingApps, matchingWidgets })` devient `hasRight(session)` (ARCHITECTURE §6). `storageName` et `display*` disparaissent (voir 3) |
| 2 | `index.ts` : `module.exports = new NavigableModule({ config, getRoot, reducer })` | `export default new EntModule({ name, scope, matchEntcoreApp, entTrackingName, redux: { reducer }, screens, modals, entries })`, ou `CoreModule` pour un module sans app ENT |
| 3 | `displayAs: 'myAppsModule'` / `'tabModule'`, `displayI18n`, `displayPicture*`, `displayOrder` | `entries.myApps: { route }` ou `entries.tab: { route, iconActive, iconInactive, order, testId, labelI18n }` ; la route ne prend pas de params obligatoires (`StaticScreenProps<… \| undefined>`) |
| 4 | `navigation/navigator.tsx` : `createModuleNavigator(...)` et un `<Stack.Screen>` par écran ; `navigation/index.ts` : noms de routes et paramètres | les deux fichiers supprimés ; chaque `<Stack.Screen>` devient une entrée de `screens`, chaque écran présenté en modale une entrée de `modals` (`defineModal`) |
| 5 | routes `${moduleConfig.routeName}/…`, route d'accueil = nom du module | **renommées** `<module>/<dossier de l'écran>` en kebab-case (`support/create-ticket`). Le suffixe de la route d'accueil se **demande au développeur**. Les noms de la télémétrie changent (`trackView` découpe la route sur `/`) : les noter dans la fiche |
| 6 | écran : `computeNavBar` avec `navBarOptions(...)`, `headerAction` de `~/app/navigation/util`, props `NativeStackScreenProps`, `props.navigation` | `export default defineScreen({ options: () => ({ title, ...headerRightActions(…) }), screen })` ; props `StaticScreenProps<Params>` ; `useNavigation()` dans le composant. Titre par `title`, jamais `headerTitle` (sauf `headerTitle: () => ''` pour masquer le titre : CONVENTIONS « UI ») |
| 7 | écran en classe qui lit `this.props.navigation` | la classe ne change pas : un petit écran fonction lit `useNavigation()` et lui passe `navigation` en prop (modèle : `src/modules/auth/sign-in/screens/wayf.tsx`) |
| 8 | `navigation.setOptions({ headerRight: <NavBarAction …/>, headerLeft, … })`, `navBarOptions` dans un effet | options de l'écran. Un bouton qui dépend de l'état de l'écran garde `setOptions`, dans un `useLayoutEffect`, avec les nouveaux items : `navigation.setOptions(headerRightActions(headerAction({ …, testID })))` (modèle : `src/modules/myapps/screens/favorites/screen.tsx`) |
| 9 | `~/framework/navigation/*` : `navBar`, `helper` (`navigate` par l'ancien `navigationRef`, plus branché), `hideTabBarAndroid`, `tabModules` | navigation par hooks, `~/app/navigation-new`. `~/framework/navigation/modals` (modales globales) : condition d'arrêt |
| 10 | `usePreventBack({ showAlert, title, text, actionOnBack })` (`~/framework/hooks/prevent-back`) | `useConfirmRemove(showAlert, { title, text, onConfirm: actionOnBack })` (`~/app/navigation-new`) |
| 11 | `AllModules()` (renvoie `[]` : le code qui l'appelle plante), `moduleConfig.*` d'un autre module | `useModules()`, `useModule(name)`, `useModulesRecord()` (CONVENTIONS « Portage ») |
| 12 | `callAtLogin` | `sessionSetup` (ce que l'app ne peut pas afficher sans) ou `onSessionStart` (le reste), branchés dans `index.ts` et appelant les actions existantes. Sans eux, rien n'est chargé à la connexion |
| 13 | storage avec migrations (`Storage.account` / `Storage.device`) | déclaré dans `storages: [...]`, sinon il lève une exception à l'usage. Clés et namespaces inchangés |
| 14 | imports de `~/framework/modules/auth` (`getSession`, `assertSession`, types) | `~/modules/auth/store/accounts`, `~/modules/auth/model` |
| 15 | d'autres modules importent `module-config.ts` ou `navigation/` du module | une **façade** `@deprecated` reste au même chemin, avec seulement ce qu'ils lisent (nom, routes renommées, préfixe d'actions) ; ils ne changent pas. Supprimée quand plus personne ne l'importe |
| 16 | import du **code** d'un module ancien (service, utilitaire, constantes, types) | gardé, avec `ToDo(<module>-migration): <raison>` et une ligne dans la fiche (§2) |
| 17 | module absent du registre | une ligne dans `src/app/config/modules.ts`, **quelle que soit la marque** : la liste des modules par marque n'existe pas encore dans le nouveau système ([later.md](journal/later.md)) |
| 18 | écran qui lit la session : `getSession()` / `assertSession()` dans l'écran ou dans son `mapStateToProps`, `sessionScreen` (`~/framework/components/screen`), `withSession` de `~/framework/modules/auth/util` | `withSession` (`~/modules/auth/hoc`) posé à la définition de l'écran, puis son `displayName` : `const Écran = withSession<StaticScreenProps<Params>>(function ({ route, session }) { … });` et `Écran.displayName = 'Écran';` ; `defineScreen` / `defineModal` reçoivent l'écran tel quel (`screen: Écran`). L'écran reçoit `session` en prop, garantie, et les storages par compte (`Storage.account`) travaillent sur son compte (`AccountStorageProvider`). Avec `connect(`, `withSession` enveloppe le composant connecté au même endroit (`const Écran = withSession<…>(connect(…)(…))`, même `displayName`), et la session arrive en second argument de `mapStateToProps` (`(state, { session }) => …`) au lieu de `getSession()`. Modèle : `src/app/test/amodule.tsx` (décidé le 2026-11-24) |
| 19 | `notif-handler.ts`, branché par `setUpNotifHandlers()` en bas de l'ancien `index.ts` | **converti en `intents.notification`**, dans `intents.ts` à la racine du module (décidé le 2026-11-24 avec `blog`, à la place du débranchement décidé le 2026-11-19 ; fichier à part décidé le même jour, CONVENTIONS « Structure d'un module »).<br>• Chaque entrée de `registerNotifHandlers` devient un `notificationIntent({ type, eventType, callback })`.<br>• `{ managed: 0 }` devient `false`, `{ managed: 1 }` devient `true`.<br>• L'action de navigation devient `navigation.navigate(<route nouvelle>, params)`, avec la même action (`navigate` reste `navigate`).<br>• Ce qui part : `trackInfo`, l'onglet de `timeline` (`computeTabRouteName`) et `handleNotificationNavigationAction` (un simple `dispatch`).<br>• `notif-handler.ts` est supprimé.<br>Rien ne lit encore ces intents : sur la branche, les notifications du module s'ouvrent sur le web, jusqu'à leur lecture par `notifications`, à concevoir avec `timeline` avant la livraison. Modèle : `blog` |
| 20 | widget ou section de l'accueil (`MYAPPS_WIDGET`, `home-widget`, `home-section`) | **hors de la migration** : fait à part par l'équipe (développements parallèles). Le code reste tel quel, non branché, avec un `ToDo(<module>-migration)` et une ligne dans la fiche |
| 21 | fichier **mort et cassé** du module : importé nulle part (`grep` du chemin, alias `~/` et imports relatifs) et en erreur `tsc` (souvent des types retirés par un changement plus ancien) | **supprimé** pendant la bascule (décidé le 2026-11-23, modèle : `model/index.ts` d'`explorer`, [explorer.md](journal/explorer.md) décision 11). Une ligne dans la fiche (§4), avec le `grep` qui prouve qu'il est mort et les erreurs qui partent. Un fichier mort qui compile (`styles.ts` orphelin…) reste, au backlog (§5) |

**Emplacement** : le module reste où il est, dans `src/framework/modules/` (ARCHITECTURE §2). Il n'est jamais déplacé vers `src/modules/`, sauf s'il y a déjà un dossier (`user`, `audience`…) : on continue là. Décidé le 2026-11-19.

Reducer, actions, service, modèle et styles ne sont pas ouverts, sauf pour un import.

Exemple complet : le commit de bascule de `support`, puis son alignement du 2026-11-19 (route renommée, `useConfirmRemove`, `withSession`, `ToDo` sur les imports de `workspace`).

## S'arrêter et demander

- Le module **navigue vers un module ancien** (ses routes, `<module>RouteNames`) ou **lit son state** : ce module n'est pas chargé par l'app. Un import de son code seul n'arrête pas (geste 16).
- La bascule demande une **évolution du framework** (`src/app/`, `navigation-new`, `framework/util`) : elle part avant, dans un changement à part.
- Le module utilise une modale globale (`~/framework/navigation/modals`) : pas d'équivalent dans le nouveau système pour l'instant ([later.md](journal/later.md)). Un handler de notification ou un widget n'arrête plus la bascule (gestes 19 et 20).
- Plus de trois fichiers touchés hors du dossier du module (les façades sont dans le module et ne comptent pas).
- Un composant ou un hook ne marche pas dans la nouvelle navigation alors qu'il n'est pas dans les gestes : c'est un geste à ajouter, à décider avec le développeur.

## Ne pas faire pendant la bascule

Chaque envie se note en une ligne dans la fiche du module, §5 : c'est le backlog de `/sanitize-module`.

- `connect(` vers des hooks, classe vers fonction (au-delà du geste 7) ;
- suppression de `tryAction` / `tryActionLegacy` / `handleAction` ;
- `React.useCallback`, `React.useMemo`, `React.memo`, performance ;
- styles statiques en ligne ou `StyleSheet.create` hors de `styles.ts` : la règle `.claude/rules/DESIGN-SYSTEM.md` (déplacer vers `styles.ts`) et les règles d'écriture de `COMPONENTS.md` / `SCREENS.md` ne s'appliquent pas au code porté pendant la bascule ;
- structure du module, refonte du modèle ou du service, `getModuleTransport`, API publique (types, hooks, utilitaires exposés aux autres modules) ;
- conversions d'interface : bottom sheet (`@gorhom/bottom-sheet`, `CustomBottomSheetModal`, `BottomMenu`) vers `formSheet`, `react-native-modal` / `ModalBox` vers `transparentModal`, tant qu'elles marchent ;
- `moment` vers Temporal ; `rights.ts` vers `hasRight` (change ce que l'utilisateur voit) ;
- correction de bug, sauf une régression causée par le nouveau système ;
- reformatage, erreurs `tsc` ou ESLint déjà présentes (modèle comme reste du code), sauf celles d'un fichier mort et cassé, supprimé (geste 21) ;
- jamais : Redux vers zustand (hors des deux skills), changement d'API serveur.

## Vérifier

1. `tsc` comparé **fichier par fichier** avec la mesure d'avant (une erreur créée et une erreur supprimée s'annulent dans un total) : `diff "$SCRATCHPAD/tsc-avant.txt" "$SCRATCHPAD/tsc-apres.txt"`, même commande (`$SCRATCHPAD` : le scratchpad de la session, hors du dépôt).
2. `yarn migration-status` : navigation ancienne à zéro pour le module, statut au moins `basculé, sans test` ; chaque module ancien encore importé est justifié dans la fiche.
3. `testID` et clés de stockage inchangés (exception connue : `header-back` devient `BackButton`, bouton natif du framework).
4. Les flows Maestro du module passent comme avant, ou la fiche dit ce qui n'a pas été joué et la recette manuelle qui le remplace.
5. Fiche, [JOURNAL.md](journal/JOURNAL.md) et [SUIVI.md](journal/SUIVI.md) mis à jour dans le même commit que le module.
