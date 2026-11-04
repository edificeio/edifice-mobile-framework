# Conventions de migration

Règles valables **pour toute la durée de la migration**, pour tous les modules. Elles s'appliquent d'office : une fiche de module n'a pas à les répéter, seulement à noter une exception validée.

## Portage

- **Porter tel quel.** Écrans et composants gardent leur code (mêmes composants du framework, classes comprises). La qualité s'améliore plus tard, écran par écran. Exceptions : ce que liste la section « Ancienneté de conception à corriger au passage » de la fiche, et les conversions d'UI ci-dessous.
- **Façades `@deprecated`.** Les anciens chemins restent comme façades qui lisent le nouveau code : les consommateurs anciens ne changent pas. On les supprime quand plus rien ne les importe.
- **Marqueurs.** Ce qui est volontairement reporté porte un `ToDo(<module>-migration): …` dans le code.
- **Images** : composants ponts de `src/modules/media` (`Image`, `FastImage`, `Video`, `Pdf`), jamais les paquets natifs directement (règle ESLint). `framework/util/media-deprecated` est à supprimer.
- **Accès aux modules** : par les hooks (`useModules()`, `useModulesOfType()`…), jamais par le registre statique `AllModules()`.

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

## Données et état

- Garder le **gestionnaire d'état du module** sauf décision contraire (`myapps` reste en Redux). Redux d'un module nouveau : `redux: { reducer }` dans sa config, reducer créé avec `createSessionReducer` (`~/framework/util/redux/reducerFactory`) pour être vidé à la fin de session.
- **Chargement** par les hooks de session du module (`src/app/module/types.ts`) : `sessionSetup` pour ce que l'app ne peut pas afficher sans (bloquant, ne rien écrire avant le `commit`), `onSessionStart` pour le reste. Plus de `callAtLogin`.
- **Stockage** : `Storage.account` / `Storage.device` (`~/framework/util/storage`), déclarés dans `storages` de la config ; dans les écrans, les hooks `useStorageBoolean` / `useStorageJSON`… plutôt que lecture + `useState`. **Clés et namespaces inchangés**, ids de migration conservés.

## Vérification

- Fichiers nouveaux ou touchés : eslint + tsc sans nouvelle erreur (le repo a une base d'erreurs tsc préexistantes).
- Logique pure : tests Jest colocalisés (`*.test.ts`), lancés par `yarn test`.
- `testID` existants conservés (tests E2E).
