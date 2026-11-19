# Conventions de migration

Règles valables **pour toute la durée de la migration**, pour tous les modules, pendant la bascule (`/migrate-module`) comme pendant l'assainissement (`/sanitize-module`) : voir [INTENT.md](INTENT.md) §4. Elles s'appliquent d'office : une fiche de module n'a pas à les répéter, seulement à noter une exception validée.

## Portage

- **Porter tel quel.** Pendant la bascule, écrans et composants gardent leur code (mêmes composants du framework, classes comprises) : seuls changent les gestes de [BASCULE.md](BASCULE.md), c'est-à-dire ce qui ne marche pas dans la nouvelle navigation. La qualité s'améliore ensuite, un sujet par PR, avec `/sanitize-module`.
- **Règles d'écriture du dépôt.** Pendant la bascule, `.claude/rules/DESIGN-SYSTEM.md` (déplacer les styles vers `styles.ts`) et les règles d'écriture de `COMPONENTS.md` / `SCREENS.md` (`useCallback`, `useMemo`…) ne s'appliquent pas au code porté : ce sont les sujets `styles` et `performance` de `/sanitize-module` (décidé le 2026-11-19). Elles s'appliquent au code nouveau. `SCREENS.md` décrit encore la création d'écran de l'ancienne génération (`navigation/`, `computeNavBar`, `withSession` par la façade) : pour un écran du nouveau système, suivre ce fichier et [BASCULE.md](BASCULE.md).
- **Session dans un écran** : `withSession` (`~/modules/auth/hoc`), posé pendant la bascule sur tout écran qui lit la session ([BASCULE.md](BASCULE.md), geste 18).
- **Emplacement.** Un module basculé reste dans `src/framework/modules/`. Il n'est jamais déplacé vers `src/modules/`, sauf s'il y a déjà un dossier (`user`, `audience`…) : on continue là (décidé le 2026-11-19 ; remplace « toujours demander », 2026-11-17).
- **Façades `@deprecated`.** Les anciens chemins restent comme façades qui lisent le nouveau code : les consommateurs anciens ne changent pas. On les supprime quand plus rien ne les importe.
- **Marqueurs.** Ce qui est volontairement reporté porte un `ToDo(<module>-migration): …` dans le code.
- **Images** : composants ponts de `src/modules/media` (`Image`, `FastImage`, `Video`, `Pdf`), jamais les paquets natifs directement (règle ESLint). `framework/util/media-deprecated` est à supprimer.
- **Accès aux modules** : par les hooks (`useModules()`, `useModulesOfType()`…), jamais par le registre statique `AllModules()`. Un module par son nom : `useModule(name)` (O(1), typé pour un nom connu du code), ou l'objet `useModulesRecord()` (`.myapps`, typé) avec `getModuleByName(byName, name)` dans un callback pour un nom venu des données ; pas de `modules.find(…)`.

## UI : conversions vers react-navigation

**Quand** (décidé le 2026-11-19) : la conversion des en-têtes (dernière ligne du tableau, contenu ancien de `navigation.setOptions`) et `usePreventBack` vers `useConfirmRemove` se font **pendant la bascule** (gestes de [BASCULE.md](BASCULE.md)). Les conversions de bottom sheets et de modales se font **en assainissement** (`/sanitize-module`), sauf si le composant ne marche pas dans la nouvelle navigation (condition d'arrêt de la bascule).

| Ancien                                                                                                                   | Nouveau                                                                                                 | Exemple                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bottom sheet `@gorhom/bottom-sheet` (souvent via `CustomBottomSheetModal`, `~/framework/components/modals/bottom-sheet`) | Écran modal `presentation: 'formSheet'` (`defineModal`)                                                 | `src/modules/auth/screens/switch-account.tsx` + `accountListSheetOptions` (`sheetAllowedDetents: 'fitToContents'`, `sheetGrabberVisible: true`, `headerShown: false`) |
| Modale `react-native-modal` (souvent via `ModalBox`, `~/framework/components/ModalBox`)                                  | Écran `presentation: 'transparentModal'` (`defineModal`)                                                | `src/modules/media/screens/download/screen.tsx` (`options: () => ({ headerShown: false, presentation: 'transparentModal' })`)                                         |
| `headerAction` (`~/app/navigation/util`) + `headerRight` / `unstable_headerRightItems` écrits à la main                  | `headerLeftActions` / `headerRightActions` + `headerAction()`, `headerMenu()`… (`~/app/navigation-new`) | `src/modules/myapps/screens/home/header.tsx`, `src/app/test/amodule.tsx`                                                                                              |

- L'état local qui pilotait la sheet / la modale (`isVisible`, `ref.present()`, mode d'affichage…) disparaît : on navigue vers l'écran, ses données passent en **params typés** (déduits des props du composant).
- Plusieurs contenus d'une même sheet (un « mode ») = plusieurs écrans.
- **Signaler les autres cas** où react-navigation ferait mieux que le code actuel (dans §5 de la fiche, backlog de `/sanitize-module`, statut `à valider`). Exemples déjà vus :
  - `useScrollToTop(ref)` au lieu d'écouter `tabPress` à la main ;
  - `usePreventRemove` / `useConfirmRemove` (`src/app/navigation-new/confirm-remove.tsx`) au lieu d'intercepter seulement le bouton fermer (le geste de fermeture d'une modale passe sinon outre la confirmation) ;
  - options de l'écran (`defineScreen({ options })`, ou un composant de header qui lit ses hooks, sauf pour le titre : voir plus bas) au lieu de `navigation.setOptions` dans un effet. `setOptions` reste permis pour un bouton qui dépend de l'état de l'écran, dans un `useLayoutEffect`, avec les nouveaux items (`headerRightActions(…)`, modèle : `src/modules/myapps/screens/favorites/index.tsx`) ;
  - enchaînements d'écrans par la navigation plutôt que par des `setTimeout`.
- **Titre de l'en-tête : jamais `headerTitle`** (composant de titre), même pour un titre lu dans le store : on perd le titre natif. Le titre passe par l'option `title` (décidé le 2026-11-17, [wiki.md](journal/wiki.md) §7 ; moyen de lire le store : question 7 de cette fiche). **Exception** : `headerTitle: () => ''` pour **masquer** le titre en gardant `title` (libellé du menu « retour ») ; `title: ''` ne convient pas, l'en-tête affiche alors le nom de la route (décidé le 2026-11-19, modèle : `src/modules/auth/sign-in/screens/platforms.tsx`).

## Nommage et rédaction

- **Ne pas traduire les noms** : composants (`MyAppsCard`, pas « carte d'app »), écrans, hooks, routes, clés de config, dans la doc comme dans le code.
- « **requirements** », jamais « prérequis » (étape d'auth : CGU, mot de passe, MFA…). Pour « étape à faire avant », écrire « préalable ».
- Noms de dossiers, modules et routes en kebab-case.
- **Routes** : `<module>/<dossier de l'écran>` (`support/create-ticket`), renommées pendant la bascule. Le suffixe de la route d'accueil d'un module ancien (souvent le nom du module seul) se demande au développeur. Les noms de la télémétrie changent avec la route : la fiche du module les note (décidé le 2026-11-19).

## Structure d'un module

C'est la cible de l'**assainissement** (`/sanitize-module`), un sujet par PR ; la bascule ne réorganise pas le module.

Exemple : `src/modules/myapps` (décidé le 2026-11-06 ; voir §5.2 et §5.3 de [myapps.md](journal/myapps.md)).

- `model/` : le **domaine**, agnostique du contexte (ni API, ni store, ni storage, ni modules de l'app).
  - `index.ts` : les types.
  - Les **règles** métier : fonctions pures ; ce qu'elles doivent savoir de l'app (traductions, modules) leur est passé en paramètre. Dans `business.ts` si elles sont peu nombreuses, sinon **regroupées par objectif** (`display.ts`, `opening.ts`, `classification.ts`…), pas un fichier par petite règle. Une liste filtrée ou triée par des règles pures (ex. `filterApps`) est une règle.
  - Une règle arbitraire ou compliquée (héritée, cas particuliers en dur, algorithme en plusieurs étapes) doit **se voir** : son propre fichier ou sa propre fonction, un en-tête qui dit d'où elle vient, des étapes ou des cas nommés plutôt qu'une expression enchaînée.
- `actions.ts` : les **actions de l'utilisateur** (charger, enregistrer, ouvrir…), qui orchestrent session, service et store (thunks Redux s'il y a un store ; sinon fonctions async simples, comme `src/framework/modules/support/actions.ts`).
  - **Session** : une action appelée depuis un écran la **reçoit en paramètre** (l'écran l'a par `withSession`) : explicite, et testable sans le store d'auth. `getSession()` reste permis pour une action appelée hors d'un écran (hooks de session, notifications) (décidé le 2026-11-19 ; `myapps`, plus ancien, lit encore `getSession()` dans ses actions).
- `util.ts` : utilitaires qui ne sont pas des règles (chaînes, `testID`…).
- `service/` : appels à l'API.
  - Les types de l'API sont dans un `namespace API` (`service/types.ts`, ex. `API.EntAppResponse` ; le fichier s'appelle `types.ts` comme tout fichier de types d'un dossier, pas `api.ts` : décidé le 2026-11-19) et **ne sortent pas de `service/`**. `API` contient les formats **reçus du backend ou envoyés au backend**, et rien d'autre (un résultat du service fait de types du modèle, comme `SignInResult` d'`auth`, est un type du modèle).
  - **Format identique au modèle** (décidé le 2026-11-19) : le type est écrit **une fois, dans le modèle** ; `API` l'aliase (`export type MFAValidationStateResponse = Model.IEntcoreMFAValidationState`, avec `import type * as Model from '…/model'`). Si le format diverge, l'alias devient un vrai type de `API` et l'adapter traduit. Le modèle n'importe jamais `service/types.ts`. Modèle : `src/modules/auth/service/types.ts`.
  - `adapter.ts` traduit le format de l'API vers le modèle (et inversement pour les écritures). Le service **renvoie des types du modèle**, hydratés.
- `store/` : la **plomberie** du gestionnaire d'état (type du state, reducer ou store zustand, action creators Redux dans `action-creators.ts`, sélecteurs), sans les actions de l'utilisateur. Le type du state n'est pas dans le modèle.
- `session.ts` : les hooks de session du module (`sessionSetup`, `onSessionStart`…), créés par une fonction qui reçoit ses dépendances (dispatch, traduction) pour être testables ; `index.ts` les branche.
- `storage.ts` : le storage et le format de ce qu'il garde.
- **Fichiers de hooks** : les hooks d'un composant (ou d'un dossier) sont dans `hooks.ts`, pas dans un fichier par hook nommé `useXxx.ts`. Les regrouper dans un seul fichier est la règle, sauf s'il devient vraiment long.
- **Types** : un type utile à **plusieurs fichiers** va dans le fichier de types de son dossier : `types.ts` (ex. `src/app/module/types.ts`, `hooks/types.ts`), `model/index.ts` pour le domaine, `store/state.ts` pour le state, `service/types.ts` pour l'API. Un type **interne**, qui ne sert qu'à un fichier, reste dans ce fichier, non exporté, voire sans nom (type écrit directement dans la signature).
- Chaque fichier de logique pure a son test à côté (`*.test.ts`). Un test qui a besoin de modules fictifs ne prend pas les modules de test de l'app (`amodule`…, voués à disparaître) : il surcharge le type de la fonction testée pour accepter un nom quelconque (exemple : `src/app/module/rights.test.ts`). Mocker un service ancien exporté par défaut demande `jest.mock('…', () => ({ __esModule: true, default: { … } }))` (exemple : `src/framework/modules/support/actions.test.ts`).
- **Droits par fonction** (ancien `rights.ts`, actions autorisées de la session) : des règles pures de `model/business.ts` (`canCreateTicket(authorizedActions)`), testées.
- **N'imiter que les couches que le module possède** : un module sans state n'a ni `store/`, ni `session.ts`, ni `storage.ts`.
- **Dossier d'un écran** (décidé le 2026-11-19) :
  - écran **avec un template** (composant d'écran fourni par un autre module, ex. les templates de `src/modules/auth/templates/`) : un seul fichier `screens/<écran>.tsx`, avec le composant qui consomme le template et son `defineScreen` (modèle : `src/modules/auth/sign-in/screens/wayf.tsx`) ;
  - écran **sans template** : un dossier `screens/<écran>/` ; `defineScreen` dans `screen.tsx` ; `index.ts` ne fait que réexporter ; `styles.ts` à côté ; `types.ts` seulement pour des types utilisés par plusieurs fichiers (modèle : `src/framework/modules/support/screens/create-ticket/`).

## Styles

Pendant l'assainissement (sujet `styles`), en plus de `.claude/rules/DESIGN-SYSTEM.md` (décidé le 2026-11-19) :

- Une valeur en dur ne devient une constante (`theme`, `UI_SIZES`…) que si l'équivalent est **exact** (`borderWidth: 1` → `UI_SIZES.border.thin`). Sinon elle reste, et va en §5 de la fiche : la remplacer changerait l'écran.
- Un style propre à une plateforme reste conditionnel dans le JSX (`Platform.OS === 'android' && styles.x`). Pas de `Platform.select` par propriété dans `styles.ts` : une clé `undefined` écrase, dans un tableau de styles, celle d'une bibliothèque.
- `theme.ui` n'est pas touché (DESIGN-SYSTEM).

## Données et état

- **App ENT ou module** : pour afficher une app (couleurs, icône, libellé, image), passer par son nom ENT (`useEntAppDisplay`, `EntAppImage`) quand il vient du serveur, et par le module (`useModuleAppDisplay`, `ModuleImage`, nom typé `AllModulesNames`) quand le module est connu du code.
- **Couleurs de la palette** : un champ ou un paramètre qui désigne une couleur de la palette est typé `ThemeColorName` (`~/app/theme` : `keyof palette.complementary` + `primary` / `secondary`), jamais `string`, pour l'autocomplétion. Un nom qui vient de l'extérieur (serveur) est vérifié par `isThemeColorName` ; ses nuances s'obtiennent par `getThemeColorShades`.

- **Gestionnaire d'état** : un module garde le sien. Le passage de Redux à zustand est **hors des deux skills** : on ne le fait plus (décidé le 2026-11-19). Exception : `user` (store des profils en zustand, décidé le 2026-11-17). Redux d'un module nouveau : `redux: { reducer }` dans sa config, reducer créé avec `createSessionReducer` (`~/framework/util/redux/reducerFactory`) pour être vidé à la fin de session. Le reducer accepte **toute action** (`createSessionReducer<State>(…)`, sans union d'actions) : Redux 5 type sinon le state global à `never` ; chaque handler retrouve son action avec `Extract<…, { type }>` (exemple : `src/modules/myapps/store/index.ts`).
- **Ce qui va dans le state** : les données du modèle hydratées par le service, une copie par donnée. Les données qui changent indépendamment restent séparées (ex. les apps et les favoris de `myapps`). Ce qui dépend du code de l'app ou des droits (modules disponibles…) n'est **pas** stocké : un hook le lit et le combine à la lecture. Jamais d'objet non sérialisable (instance de module, fonction) dans Redux.
- **Requêtes signées** : quand les API du module commencent par un de ses scopes (`/userbook/…` pour `userbook`), les appeler par `getModuleTransport('<module>')` (`~/framework/util/transport`) : un chemin hors des scopes du module ne compile pas. Les autres (`/api/me/applications`, sous `portal`), les URL absolues et les chemins de type `string` passent par les fonctions du transport directement. Exemple : `src/modules/myapps/service/index.ts`.
- **Chargement** par les hooks de session du module (`src/app/module/types.ts`) : `sessionSetup` pour ce que l'app ne peut pas afficher sans (bloquant, ne rien écrire avant le `commit`), `onSessionStart` pour le reste. Plus de `callAtLogin`.
- **Stockage** : `Storage.account` / `Storage.device` (`~/framework/util/storage`), déclarés dans `storages` de la config ; dans les écrans, les hooks `useStorageBoolean` / `useStorageJSON`… plutôt que lecture + `useState`. **Clés et namespaces inchangés**, ids de migration conservés.

## Vérification

- Fichiers nouveaux ou touchés : eslint + tsc sans nouvelle erreur (le repo a une base d'erreurs tsc préexistantes). `tsc` se compare **fichier par fichier**, pas en nombre d'erreurs (commande dans [BASCULE.md](BASCULE.md) « Avant de commencer »).
- Logique pure : tests Jest colocalisés (`*.test.ts`), lancés par `yarn test`.
- `testID` existants conservés (tests E2E).
