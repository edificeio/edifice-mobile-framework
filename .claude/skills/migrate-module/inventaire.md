# Inventaire d'un module ancien

Relevé en lecture seule. La partie « Bascule » sert à l'étape 2 de `/migrate-module` et remplit §1 à §5 de la fiche ; la partie « Assainissement » sert à `/sanitize-module`. Citer des chemins depuis la racine ; ne pas recopier le code.

`<dir>` = dossier du module, `<module>` = son nom.

## Bascule

### 1. Le module, geste par geste

Pour chaque ligne : ce qu'il y a dans le module, et le geste de [BASCULE.md](BASCULE.md) qui s'applique. Ce qui marche dans la nouvelle navigation sans geste va dans §5 de la fiche.

| Où regarder | Ce qu'il faut relever | Geste |
| --- | --- | --- |
| `module-config.ts` | `name`, `entcoreScope`, `matchEntcoreApp`, `hasRight` (ancienne signature `matchingApps, matchingWidgets`), `displayAs` (`tabModule` / `myAppsModule`), `display*`, `storageName`, `entcoreTrackingName`, `fileManager`, `routeName` | 1, 3 |
| `index.ts` | `NavigableModule`, ou `EntModule` d'une API intermédiaire ; `setUpNotifHandlers`, widgets ou sections branchés après `module.exports` | 2 ; notifications : 19 ; widgets : 20 |
| `navigation/` | Noms de routes (route d'accueil = nom du module ?), params, `Stack.Group` en modale, options d'écran | 4, 5 |
| `screens/` | `computeNavBar`, `navBarOptions`, `headerAction` de l'ancienne navigation, `NativeStackScreenProps`, `props.navigation`, composants classe, `navigation.setOptions` et son contenu, `usePreventBack`, `testID` | 6, 7, 8, 10 |
| Tout le dossier | Imports de `~/framework/navigation/*` (`navBar`, `helper`, `hideTabBarAndroid`, `tabModules`, `modals`), `AllModules()`, `moduleConfig.*` d'un autre module, imports de `~/framework/modules/auth` | 9, 11, 14 ; `modals` : arrêt |
| `callAtLogin`, `calls-at-login` | Ce qui est chargé à la connexion, bloquant ou non | 12 |
| Écrans qui lisent la session | `getSession()` / `assertSession()` dans l'écran ou son `mapStateToProps`, `sessionScreen`, `withSession` de `~/framework/modules/auth/util` | 18 |
| `storage*` | Clés, namespaces, migrations, API de storage utilisée | 13, clés inchangées |
| Imports d'autres modules anciens | Pour chacun : code seul (service, util, constantes, types) ou navigation / state | 16 ; navigation / state : arrêt |
| `notif-handler.ts`, widgets (`home-widget.ts`, `home-section.ts`), intents | Types gérés, routes ouvertes | handler : 19 (débranché) ; widget : 20 (hors migration) ; intent : arrêt ([framework.md](framework.md)) |

Relever aussi, pour §5 de la fiche (sans y toucher) : `connect(`, `tryAction` / `tryActionLegacy` / `handleAction`, classes, `useCallback` / `useMemo` manquants, styles en ligne ou `StyleSheet.create` hors de `styles.ts`, ce que les autres modules importent (API publique : types, hooks, utilitaires), `moment`, bottom sheets et modales (`@gorhom/bottom-sheet`, `CustomBottomSheetModal`, `BottomMenu`, `react-native-modal`, `ModalBox`), `rights.ts`, structure du dossier, erreurs `tsc` / ESLint existantes, bugs vus à la lecture, fichiers orphelins (un fichier orphelin **et** en erreur `tsc` est supprimé dans la bascule : geste 21).

### 2. Importeurs

Qui importe le module, et quoi. Chemins avec alias `~/` ; vérifier aussi les imports relatifs.

```bash
grep -rln "framework/modules/<module>" src | grep -v "^<dir>/"
grep -rn "<module>/module-config\|<module>/navigation\|moduleConfig.routeName" src | grep -v "^<dir>/"
grep -rln "<module>" src/app 2>/dev/null
```

Pour chaque importeur :

- chemin et export inchangés : rien à faire ;
- il importe `module-config.ts` ou `navigation/` : **façade** au même chemin (geste 15), avec les routes renommées ;
- il est lui-même ancien et non chargé : le noter, ne pas le migrer.

Navigation entrante : les modules qui naviguent vers les routes du module (noms de routes en dur, `<module>RouteNames`), l'ouverture par `myapps` (`entries.myApps`, `matchEntcoreApp`), les liens d'autres modules (`entries.userMenu`), les liens profonds et intents (`src/app/intents.ts`).

### 3. Comportements à conserver

Liste vérifiable pour §3 de la fiche : données affichées et règles métier (tri, filtres, cas particuliers en dur), écritures vers le serveur, stockage (clés), `testID` (tests E2E), textes i18n, comportements au focus / à l'appui sur l'onglet, confirmations de sortie. Les fonctionnalités faciles à oublier vont en tête (exemple : §1 de [journal/myapps.md](journal/myapps.md)). Pour chacune : un flow Maestro proposé, ou la recette manuelle en une ligne.

## Assainissement

### 4. Points à assainir

Pour un sujet de `/sanitize-module`, chaque point avec constat, correction proposée et statut (`à faire` · `à valider` · `noté`) :

- conversions d'UI ([CONVENTIONS.md](CONVENTIONS.md) « UI ») : `@gorhom/bottom-sheet` / `CustomBottomSheetModal` → `formSheet` (un mode de sheet = un écran) ; `react-native-modal` / `ModalBox` → `transparentModal` ;
- cas où react-navigation ferait mieux : `useScrollToTop`, navigation au lieu de `setTimeout` ;
- écrans qui renvoient des valeurs à l'écran précédent par ses params (`navigate(…, { new* }, { pop: true })`) : les valeurs passent par le store du module, que l'écran précédent lit ; l'écran d'édition peut alors être une modale (décidé pour `user`) ;
- `connect(` vers les hooks, suppression de `tryAction` (son option `track` part avec lui, sans appel à `Trackers`), classes vers fonctions ;
- performance : `useCallback` / `useMemo` / `React.memo` ([.claude/rules/COMPONENTS.md](../../rules/COMPONENTS.md) §4) ;
- styles statiques vers `styles.ts` ([.claude/rules/DESIGN-SYSTEM.md](../../rules/DESIGN-SYSTEM.md)) ;
- API publique : types, hooks, utilitaires, composants utilisés par les autres modules ;
- erreurs `tsc` et ESLint du modèle et du reste du code ;
- structure du module ([CONVENTIONS.md](CONVENTIONS.md) « Structure d'un module ») : `model/`, `actions.ts`, `service/` (`types.ts`, `adapter.ts`, `getModuleTransport`), `store/`, `storage.ts`, `session.ts` ;
- `moment` → `Temporal` (`media` et `user` y sont passés) ;
- `rights.ts` → `hasRight` : change ce que l'utilisateur voit (sans le droit, le module devient indisponible : son entrée « Mes applis » ouvre l'app web dans le navigateur (`useOpenApp`, `src/modules/myapps/hooks/apps.ts`) au lieu de l'écran vide ; son onglet, s'il en a un, est masqué), à valider ;
- bugs ou dette **locaux au module**. Ce qui touche d'autres modules va en question ou dans [journal/later.md](journal/later.md).

Pas de passage de Redux à zustand (hors des deux skills).

### 5. Recettes de vérification

Commandes qui prouvent qu'un changement d'assainissement ne casse rien (`<module>`, `<dir>` comme plus haut) :

| Pour | Commande |
| --- | --- |
| Un reducer, un type d'action ou un sélecteur est mort | `grep -rn "state\.<module>\|<TYPE_D_ACTION>\|<sélecteur>" src` hors de `<dir>` : rien |
| Élargir ou changer un type partagé | `grep -rn "<champ ou type>" src` : liste de ses lecteurs ; puis `tsc` fichier par fichier sur tout le dépôt (des erreurs d'autres modules peuvent disparaître : les noter) |
| `testID` inchangés | `git diff -- <dir> \| grep -E "^[-+].*testID"` : seulement des lignes déplacées, aucune valeur changée |
| Clés de stockage et i18n inchangées | `git diff -- <dir> \| grep -E "^[-+].*(I18n\.get\|Storage\.)"` : idem |
| Un appel au serveur inchangé | test de l'adapter qui compare le corps envoyé à l'ancien (ex. `src/framework/modules/support/service/adapter.test.ts`) |
| Plus de `connect(` | ligne du module dans `journal/SUIVI.md` après `yarn migration-status`, colonne `connect(` |
