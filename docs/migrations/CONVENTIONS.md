# Conventions de migration

Règles valables **pour toute la durée de la migration**, pour tous les modules. Elles s'appliquent d'office : une fiche de module n'a pas à les répéter, seulement à noter une exception validée.

## Portage

- **Porter tel quel.** Écrans et composants gardent leur code (mêmes composants du framework, classes comprises). La qualité s'améliore plus tard, écran par écran. Exceptions : ce que liste la section « Ancienneté de conception à corriger au passage » de la fiche, et les conversions d'UI ci-dessous.
- **Façades `@deprecated`.** Les anciens chemins restent comme façades qui lisent le nouveau code : les consommateurs anciens ne changent pas. On les supprime quand plus rien ne les importe.
- **Marqueurs.** Ce qui est volontairement reporté porte un `ToDo(<module>-migration): …` dans le code.
- **Images** : composants ponts de `src/modules/media` (`Image`, `FastImage`, `Video`, `Pdf`), jamais les paquets natifs directement (règle ESLint). `framework/util/media-deprecated` est à supprimer.
- **Accès aux modules** : par les hooks (`useModules()`, `useModulesOfType()`…), jamais par le registre statique `AllModules()`. Un module par son nom : `useModule(name)` (O(1), typé pour un nom connu du code), ou l'objet `useModulesRecord()` (`.myapps`, typé) avec `getModuleByName(byName, name)` dans un callback pour un nom venu des données ; pas de `modules.find(…)`.

## UI : conversions vers react-navigation

| Ancien                                                                                                                   | Nouveau                                                  | Exemple                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet `@gorhom/bottom-sheet` (souvent via `CustomBottomSheetModal`, `~/framework/components/modals/bottom-sheet`) | Écran modal `presentation: 'formSheet'` (`defineModal`)  | `src/modules/auth/screens/switch-account.tsx` + `accountListSheetOptions` (`sheetAllowedDetents: 'fitToContents'`, `sheetGrabberVisible: true`, `headerShown: false`) |
| Modale `react-native-modal` (souvent via `ModalBox`, `~/framework/components/ModalBox`)                                  | Écran `presentation: 'transparentModal'` (`defineModal`) | `src/modules/media/screens/download/screen.tsx` (`options: () => ({ headerShown: false, presentation: 'transparentModal' })`)                                         |

- L'état local qui pilotait la sheet / la modale (`isVisible`, `ref.present()`, mode d'affichage…) disparaît : on navigue vers l'écran, ses données passent en **params typés** (déduits des props du composant).
- Plusieurs contenus d'une même sheet (un « mode ») = plusieurs écrans.
- **Signaler les autres cas** où react-navigation ferait mieux que le code actuel (dans la section « Ancienneté de conception » de la fiche, statut `à valider`). Exemples déjà vus :
  - `useScrollToTop(ref)` au lieu d'écouter `tabPress` à la main ;
  - `usePreventRemove` / `useConfirmRemove` (`src/app/navigation-new/confirm-remove.tsx`) au lieu d'intercepter seulement le bouton fermer (le geste de fermeture d'une modale passe sinon outre la confirmation) ;
  - options de l'écran (`defineScreen({ options })`, ou un composant de header qui lit ses hooks) au lieu de `navigation.setOptions` dans un effet ;
  - enchaînements d'écrans par la navigation plutôt que par des `setTimeout`.

## Nommage et rédaction

- **Ne pas traduire les noms** : composants (`MyAppsCard`, pas « carte d'app »), écrans, hooks, routes, clés de config, dans la doc comme dans le code.
- « **requirements** », jamais « prérequis » (étape d'auth : CGU, mot de passe, MFA…). Pour « étape à faire avant », écrire « préalable ».
- Noms de dossiers, modules et routes en kebab-case.

## Structure d'un module

Exemple : `src/modules/myapps` (décidé le 2026-11-06 ; voir §5.2 et §5.3 de [myapps.md](myapps.md)).

- `model/` : le **domaine**, agnostique du contexte (ni API, ni store, ni storage, ni modules de l'app).
  - `index.ts` : les types.
  - Les **règles** métier : fonctions pures ; ce qu'elles doivent savoir de l'app (traductions, modules) leur est passé en paramètre. Dans `business.ts` si elles sont peu nombreuses, sinon **regroupées par objectif** (`display.ts`, `opening.ts`, `classification.ts`…), pas un fichier par petite règle. Une liste filtrée ou triée par des règles pures (ex. `filterApps`) est une règle.
  - Une règle arbitraire ou compliquée (héritée, cas particuliers en dur, algorithme en plusieurs étapes) doit **se voir** : son propre fichier ou sa propre fonction, un en-tête qui dit d'où elle vient, des étapes ou des cas nommés plutôt qu'une expression enchaînée.
- `actions.ts` : les **actions de l'utilisateur** (charger, enregistrer, ouvrir…), qui orchestrent session, service et store (thunks Redux, ou fonctions pour zustand).
- `util.ts` : utilitaires qui ne sont pas des règles (chaînes, `testID`…).
- `service/` : appels à l'API.
  - Les types de l'API sont dans un `namespace API` (`service/api.ts`, ex. `API.EntAppResponse`) et **ne sortent pas de `service/`**.
  - `adapter.ts` traduit le format de l'API vers le modèle (et inversement pour les écritures). Le service **renvoie des types du modèle**, hydratés.
- `store/` : la **plomberie** du gestionnaire d'état (type du state, reducer ou store zustand, action creators Redux dans `action-creators.ts`, sélecteurs), sans les actions de l'utilisateur. Le type du state n'est pas dans le modèle.
- `session.ts` : les hooks de session du module (`sessionSetup`, `onSessionStart`…), créés par une fonction qui reçoit ses dépendances (dispatch, traduction) pour être testables ; `index.ts` les branche.
- `storage.ts` : le storage et le format de ce qu'il garde.
- **Fichiers de hooks** : les hooks d'un composant (ou d'un dossier) sont dans `hooks.ts`, pas dans un fichier par hook nommé `useXxx.ts`. Les regrouper dans un seul fichier est la règle, sauf s'il devient vraiment long.
- **Types** : un type utile à **plusieurs fichiers** va dans le fichier de types de son dossier : `types.ts` (ex. `src/app/module/types.ts`, `hooks/types.ts`), `model/index.ts` pour le domaine, `store/state.ts` pour le state, `service/api.ts` pour l'API. Un type **interne**, qui ne sert qu'à un fichier, reste dans ce fichier, non exporté, voire sans nom (type écrit directement dans la signature).
- Chaque fichier de logique pure a son test à côté (`*.test.ts`). Un test qui a besoin de modules fictifs ne prend pas les modules de test de l'app (`amodule`…, voués à disparaître) : il surcharge le type de la fonction testée pour accepter un nom quelconque (exemple : `src/app/module/rights.test.ts`).

## Données et état

- **App ENT ou module** : pour afficher une app (couleurs, icône, libellé, image), passer par son nom ENT (`useEntAppDisplay`, `EntAppImage`) quand il vient du serveur, et par le module (`useModuleAppDisplay`, `ModuleImage`, nom typé `AllModulesNames`) quand le module est connu du code.
- **Couleurs de la palette** : un champ ou un paramètre qui désigne une couleur de la palette est typé `ThemeColorName` (`~/app/theme` : `keyof palette.complementary` + `primary` / `secondary`), jamais `string`, pour l'autocomplétion. Un nom qui vient de l'extérieur (serveur) est vérifié par `isThemeColorName` ; ses nuances s'obtiennent par `getThemeColorShades`.

- Garder le **gestionnaire d'état du module** sauf décision contraire (`myapps` reste en Redux). Redux d'un module nouveau : `redux: { reducer }` dans sa config, reducer créé avec `createSessionReducer` (`~/framework/util/redux/reducerFactory`) pour être vidé à la fin de session. Le reducer accepte **toute action** (`createSessionReducer<State>(…)`, sans union d'actions) : Redux 5 type sinon le state global à `never` ; chaque handler retrouve son action avec `Extract<…, { type }>` (exemple : `src/modules/myapps/store/index.ts`).
- **Ce qui va dans le state** : les données du modèle hydratées par le service, une copie par donnée. Les données qui changent indépendamment restent séparées (ex. les apps et les favoris de `myapps`). Ce qui dépend du code de l'app ou des droits (modules disponibles…) n'est **pas** stocké : un hook le lit et le combine à la lecture. Jamais d'objet non sérialisable (instance de module, fonction) dans Redux.
- **Chargement** par les hooks de session du module (`src/app/module/types.ts`) : `sessionSetup` pour ce que l'app ne peut pas afficher sans (bloquant, ne rien écrire avant le `commit`), `onSessionStart` pour le reste. Plus de `callAtLogin`.
- **Stockage** : `Storage.account` / `Storage.device` (`~/framework/util/storage`), déclarés dans `storages` de la config ; dans les écrans, les hooks `useStorageBoolean` / `useStorageJSON`… plutôt que lecture + `useState`. **Clés et namespaces inchangés**, ids de migration conservés.

## Vérification

- Fichiers nouveaux ou touchés : eslint + tsc sans nouvelle erreur (le repo a une base d'erreurs tsc préexistantes).
- Logique pure : tests Jest colocalisés (`*.test.ts`), lancés par `yarn test`.
- `testID` existants conservés (tests E2E).
