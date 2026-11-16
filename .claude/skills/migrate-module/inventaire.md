# Inventaire d'un module ancien

Relevé à faire à l'étape 2 du skill, en lecture seule. Le résultat remplit §1 à §4 de la fiche. Citer des chemins depuis la racine ; ne pas recopier le code.

`<dir>` = dossier du module, `<module>` = son nom.

## 1. Le module lui-même

| Où regarder                      | Ce qu'il faut relever                                                                                                                                                                                                                                      | Devient (nouveau système)                                                                                                                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `module-config.ts`               | `name`, `entcoreScope`, `matchEntcoreApp` (string ou fonction ?), `hasRight` (ancienne signature `matchingApps, matchingWidgets`), `displayAs` (`tabModule` / `myAppsModule`), `display*`, `storageName`, `entcoreTrackingName`, `testID`, `displayBadges` | Clés de `ModuleConfig` (`src/app/module/types.ts`) : `scope`, `matchEntcoreApp`, `hasRight(session)`, `tab`, `entry`, `entTrackingName`. `display*` et `myAppsModule` : voir [framework.md](framework.md) |
| `index.ts`                       | `NavigableModule` / `EntModule` d'une API intermédiaire ; `setUpNotifHandlers`, widgets ou sections branchés après `module.exports`                                                                                                                        | `export default new EntModule({...})` ou `CoreModule`                                                                                                                                                     |
| `navigation/`                    | Noms de routes, types des params, `createModuleNavigator`, options d'écran                                                                                                                                                                                 | `screens` / `modals` du module, routes `<module>/<suffixe>` en kebab-case, params typés                                                                                                                   |
| `screens/`                       | Liste des écrans ; composants classe ; `navigation.setOptions` dans un effet ; `headerAction` / `headerRight` à la main ; écoute de `tabPress` ; `setTimeout` entre écrans ; `testID`                                                                      | `defineScreen` / `defineModal`, options d'écran, `headerLeftActions` / `headerRightActions`, `useScrollToTop`                                                                                             |
| `components/`                    | Composants propres ; ceux importés par d'autres modules ; bottom sheets, modales                                                                                                                                                                           | Restent sur place ; publics → API publique ; génériques → candidats au framework                                                                                                                          |
| `reducer*`, `actions/`, `store*` | Forme du state, thunks, sélecteurs ; `createSessionReducer` ou non ; stores zustand                                                                                                                                                                        | `store/` (plomberie), `actions.ts` (actions de l'utilisateur), `redux: { reducer }` dans la config                                                                                                        |
| `service/`                       | URL appelées (sous les scopes du module ?), fonctions du transport utilisées, adaptateurs                                                                                                                                                                  | `service/` : `namespace API`, `adapter.ts`, `getModuleTransport('<module>')`                                                                                                                              |
| `model/`, `rights.ts`            | Types, règles métier, droits par fonction (workflows)                                                                                                                                                                                                      | `model/` (types + règles par objectif), droits du module                                                                                                                                                  |
| `storage*`                       | Clés, namespaces, migrations, API de storage utilisée                                                                                                                                                                                                      | `storage.ts` + `storages` de la config, **clés inchangées**                                                                                                                                               |
| `notif-handler.ts`               | Types de notifications gérés, routes ouvertes                                                                                                                                                                                                              | Pas d'équivalent : voir [framework.md](framework.md)                                                                                                                                                      |
| `calls-at-login`, `callAtLogin`  | Ce qui est chargé à la connexion                                                                                                                                                                                                                           | `sessionSetup` (bloquant) / `onSessionStart`                                                                                                                                                              |
| Widgets, sections d'accueil      | `home-widget.ts`, `home-section.ts`, sous-modules `widgets/*`                                                                                                                                                                                              | Pas d'équivalent connu : voir [framework.md](framework.md)                                                                                                                                                |

Relever aussi : `moment` (le module `media` est passé à `Temporal` : demander), les imports de paquets natifs d'images / vidéo / PDF, `Alert` et confirmations de sortie, les traductions (`assets/i18n`, clés inchangées), le tracking.

## 2. Consommateurs externes

Qui dépend du module, et par quoi le remplacer. Chemins d'import avec alias `~/` ; vérifier aussi les imports relatifs.

```bash
grep -rln "framework/modules/<module>" src | grep -v "^<dir>/"
grep -rn "<module>/module-config\|moduleConfig.routeName" src | grep -v "^<dir>/"
grep -rln "<module>" src/app __overrides__ 2>/dev/null
```

Pour chaque consommateur : ce qu'il importe (types, composants, sélecteurs, noms de routes, config), et la cible :

- reste valable (chemin et export inchangés) ;
- **façade `@deprecated`** au même chemin, qui lit le nouveau code ;
- consommateur migré vers l'API publique du module ;
- consommateur lui-même ancien et non chargé (STATUS « l'app ne charge plus les modules anciens ») : le noter, ne pas le migrer.

Navigation entrante : les autres modules qui naviguent vers les routes du module (noms de routes en dur, `moduleConfig.routeName`), l'ouverture par `myapps` (`entry`, `matchEntcoreApp`), les liens profonds et intents (`src/app/intents.ts`).

## 3. Comportements à conserver

Liste vérifiable pour §3 de la fiche : données affichées et règles métier (tri, filtres, cas particuliers en dur), écritures vers le serveur, stockage (clés), `testID` (tests E2E), textes i18n, retours haptiques, accessibilité, comportements au focus / à l'appui sur l'onglet. Les fonctionnalités faciles à oublier vont en tête (exemple : §1 de `docs/migrations/myapps.md`).

## 4. Ancienneté de conception

Pour §4 de la fiche, chaque point avec constat, correction proposée et statut (`réglé par la cible` · `à faire au portage` · `à valider` · `noté`) :

- conversions d'UI imposées (CONVENTIONS « UI ») : `@gorhom/bottom-sheet` / `CustomBottomSheetModal` → `formSheet` (un mode de sheet = un écran) ; `react-native-modal` / `ModalBox` → `transparentModal` ;
- cas où react-navigation ferait mieux : `useScrollToTop`, `useConfirmRemove` (`src/app/navigation-new/confirm-remove.tsx`), options d'écran au lieu de `setOptions`, navigation au lieu de `setTimeout` ;
- bugs ou dette **locaux au module** repérés à la lecture. Ce qui touche d'autres modules va en question (§8) ou dans `later.md`.

Par défaut on porte tel quel : un point de §4 n'est corrigé que s'il est validé.
