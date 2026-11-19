# Sélecteurs des flows `myapps`

Relevé du 2026-11-18, par `git grep -n "testID"` et `git show` sur les deux refs du dépôt mobile. Aucun sélecteur
n'a été vu dans une app lancée.

- **Ancienne** = `origin/dev/1.17.10`. Chemins abrégés : `A/` = `src/framework/modules/myapps/`,
  `AA/` = `src/framework/modules/auth/`.
- **Nouvelle** = `origin/feat/navigation`. `N/` = `src/modules/myapps/`, `NA/` = `src/modules/auth/`.
- Textes : `assets/i18n/fr.json` (numéros de ligne : ancienne / nouvelle).

**Bilan** : 33 sélecteurs `id` — 31 présents dans les deux, 1 changé (cartes d'appli), 1 absent de l'ancienne
(`myapps-favorites-validate`). 6 replis sur un texte affiché.

## 1. Par flow

### `00-connexion.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| Accueil, « S'identifier » | `onboarding-join` | `AA/screens/onboarding/screen.tsx:50` | `NA/sign-in/screens/welcome/screen.tsx:48` | présent dans les deux |
| Écran de choix de plateforme | `network-welcome-title` | `AA/templates/platforms/screen.tsx:43` | `NA/sign-in/templates/platforms/screen.tsx:55` (si `showWelcome`, vrai par défaut) | présent dans les deux |
| Carte de la plateforme | `network-${PLATFORM_NAME}` | `AA/templates/platforms/screen.tsx:37` | `NA/sign-in/templates/platforms/screen.tsx:48` | présent dans les deux |
| Champ identifiant | `login-identifier` | `AA/templates/login-credentials/screen.tsx:184` | `NA/sign-in/templates/credentials/screen.tsx:167` | présent dans les deux |
| Champ mot de passe | `login-password` | `…/login-credentials/screen.tsx:202` | `…/credentials/screen.tsx:185` | présent dans les deux |
| Bouton « Se connecter » | `login-connect` | `…/login-credentials/screen.tsx:240` | `…/credentials/screen.tsx:223` | présent dans les deux |
| CGU à revalider | texte `Accepter` | `AA/screens/requirement-terms.tsx:132` (fr.json:231) | `NA/requirements/templates/terms/screen.tsx:76` (fr.json:234) | **texte** : aucun testID dans les deux |
| Onglet Mes applis | `tabbar-myapps` | `A/module-config.ts:17`, posé par `src/app/navigation/main-navigation.tsx:140` | `N/index.ts:26`, posé par `src/app/navigation-new/tabs.tsx:90` | présent dans les deux |

### `communs/aller-mes-applis.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| Onglet | `tabbar-myapps` | voir ci-dessus | voir ci-dessus | présent dans les deux |
| Onboarding, « Plus tard » | `myapps-onboarding-modal-later` | `A/components/my-apps-onboarding-modal/component.tsx:139` | `N/screens/onboarding/index.tsx:131` | présent dans les deux |
| Liste prête | `myapps-filter-all` | `A/components/my-apps-filters/filter-config.ts:43` | `N/components/my-apps-filters/filter-config.ts:15` | présent dans les deux |

### `myapps-01-liste.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| Pas d'écran vide global | `myapps-empty-screen` | `A/screens/myapps-home-screen.tsx:282` | `N/screens/home/index.tsx:92` | présent dans les deux |
| Filtre Favoris | `myapps-filter-favorites` | `…/filter-config.ts:55` | `…/filter-config.ts:21` | présent dans les deux |
| Titre | `header-title` | `src/app/navigation/util.tsx:50` | `src/app/navigation-new/options.tsx:66` (Android) ; natif sur iOS (`ios/appe/UINavigationBarTitleIdentifier.m`, d'après le commentaire `options.tsx:51`) | présent dans les deux, mécanisme changé sur iOS |
| Cloche (jamais vu) | `myapps-navbar-notif` | `A/screens/myapps-home-screen.tsx:104` et `:128` | `N/screens/home/header.tsx:29` | présent dans les deux |
| Menu « ⋯ » | `myapps-navbar-context-menu` | `…/myapps-home-screen.tsx:115` et `:137` | `N/screens/home/header.tsx:45` | présent dans les deux |
| Au moins une carte | regex `myapps-(?!filter-…).+` sur `myapps-<name>` | `A/components/my-apps-card/component.tsx:100` ; valeur : `A/reducer/adapter.ts:146`, `A/utils/app-i18n.ts:31` | `N/components/my-apps-card/component.tsx:67` ; valeur : `N/util.ts:19` | **changé** : vide dans l'ancienne pour une appli sans config, toujours `myapps-<name>` dans la nouvelle (écart volontaire, fiche §9) |

### `myapps-02-filtres.yaml`

| Étape | Sélecteur | Ancienne (`A/components/my-apps-filters/filter-config.ts`) | Nouvelle (`N/components/my-apps-filters/filter-config.ts`) | Statut |
|---|---|---|---|---|
| Favoris | `myapps-filter-favorites` | `:55` | `:21` | présent dans les deux |
| Communiquer | `myapps-filter-communication` | `:49` | `:19` | présent dans les deux |
| Produire | `myapps-filter-pedagogie` | `:79` | `:36` | présent dans les deux |
| Organiser | `myapps-filter-organisation` | `:67` | `:26` | présent dans les deux |
| Autres services | `myapps-filter-other-services` | `:73` | `:31` | présent dans les deux |
| Tout | `myapps-filter-all` | `:43` | `:15` | présent dans les deux |
| Écran vide des favoris | `myapps-empty-favorites` | `A/screens/utils.ts:9` | `N/components/my-apps-list/utils.ts:24` | présent dans les deux |
| Écran vide global | `myapps-empty-screen` | voir flow 01 | voir flow 01 | présent dans les deux |

Le `testID` d'un filtre est posé sur la cellule : `A/components/my-apps-filters-cell/component.tsx:13`,
`N/components/my-apps-filter-cell/component.tsx:15`.

### `myapps-03-ouverture-appli.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| Carte de l'appli web | `${APP_WEB_TESTID}` (`myapps-<name>`) | `A/components/my-apps-card/component.tsx:100` | `N/components/my-apps-card/component.tsx:67` | **changé** (voir flow 01) |
| Titre de l'alerte | texte `Redirection sur le navigateur` | `src/framework/util/linking.ts:92` (fr.json:910) | `src/framework/util/linking/index.ts:26` (fr.json:914) | **texte** : alerte native |
| Bouton de l'alerte | texte `Annuler` | `src/framework/util/linking.ts:97` (fr.json:337) | `src/framework/util/linking/index.ts:29` (fr.json:340) | **texte** : alerte native |

### `myapps-04-favori-appui-long.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| Carte de l'appli | `${APP_TESTID}` (`myapps-<name>`) | `A/components/my-apps-card/component.tsx:100` | `N/components/my-apps-card/component.tsx:67` | **changé** (voir flow 01) |
| Action favori | `myapps-toggle-favorite` | `A/screens/myapps-home-screen.tsx:220` | `N/screens/app-actions.tsx:54` | présent dans les deux |
| Libellé « ajouter » | texte `Ajouter l'appli aux favoris` | `…/myapps-home-screen.tsx:216` (fr.json:1115) | `N/screens/app-actions.tsx:51` (fr.json:1119) | **texte** : seul moyen de lire l'état |
| Libellé « retirer » | texte `Retirer l'appli des favoris` | `…/myapps-home-screen.tsx:215` (fr.json:1120) | `N/screens/app-actions.tsx:51` (fr.json:1124) | **texte** |
| Toast de succès | texte `Vos modifications ont bien été enregistrées` | `A/screens/useController.ts:195` (fr.json:1112) | `N/screens/app-actions.tsx:36` (fr.json:1116) | **texte** : toast sans testID |
| Écran vide des favoris | `myapps-empty-favorites` | `A/screens/utils.ts:9` | `N/components/my-apps-list/utils.ts:24` | présent dans les deux |

### `myapps-05-menu.yaml`

| Étape | Sélecteur | Ancienne (`A/screens/myapps-home-screen.tsx`) | Nouvelle | Statut |
|---|---|---|---|---|
| Menu « ⋯ » | `myapps-navbar-context-menu` | `:115` et `:137` | `N/screens/home/header.tsx:45` | présent dans les deux |
| Gérer les favoris | `myapps-menu-manage-favorites` | `:171` | `N/screens/menu.tsx:57` | présent dans les deux |
| Accès par le navigateur | `myapps-menu-access-by-browser` | `:182` | `N/screens/menu.tsx:67` | présent dans les deux |
| Interrupteur activé / désactivé | `myapps-all-showed` / `myapps-all-hidden` | `:191` | `N/screens/menu.tsx:76` | présents dans les deux |
| Modale des favoris ouverte | `myapps-favorites-validate` | aucun : `A/components/manage-favorite-modal/component.tsx:28` (`NavBarAction` sans testID) | `N/screens/favorites/index.tsx:42` | **absent de l'ancienne** (ajouté par la migration) ; étape optionnelle |

### `myapps-06-onboarding.yaml`

| Étape | Sélecteur | Ancienne | Nouvelle | Statut |
|---|---|---|---|---|
| « Plus tard » | `myapps-onboarding-modal-later` | `A/components/my-apps-onboarding-modal/component.tsx:139` | `N/screens/onboarding/index.tsx:131` | présent dans les deux |
| Titre de la diapo | `myapps-onboarding-modal-title` | `A/components/my-apps-onboarding-modal/my-apps-onboarding-slide.tsx:26` | `N/screens/onboarding/slide.tsx:33` | présent dans les deux |
| « Suivant » | `myapps-onboarding-modal-next` | `…/component.tsx:152` | `…/index.tsx:143` | présent dans les deux |
| « Précédent » | `myapps-onboarding-modal-previous` | `…/component.tsx:139` | `…/index.tsx:131` | présent dans les deux |
| « C'est compris » | `myapps-onboarding-modal-complete` | `…/component.tsx:152` | `…/index.tsx:143` | présent dans les deux |
| Croix | `myapps-onboarding-modal-close` | `src/framework/components/ModalBox.tsx:75` (dérivé du `testID` de la modale, `…/component.tsx:87`) | `N/screens/onboarding/index.tsx:156` | présent dans les deux (hors de la liste de la fiche §3.5) |
| Cloche, jamais vu / vu | `myapps-navbar-notif` / `myapps-navbar-notif-empty` | `A/screens/myapps-home-screen.tsx:104` | `N/screens/home/header.tsx:29` | présents dans les deux |
| Autre onglet | `tabbar-timeline` | `src/framework/modules/timeline/index.tsx:34` | `src/app/test/amodule.tsx:263` (module de test chargé par `src/app/config/modules.ts` ; le vrai `timeline` y est commenté) | présent dans les deux, porté par un module de test dans la nouvelle |

## 2. Divergences entre générations (règle « testID inchangés »)

| Écart | Ancienne | Nouvelle | Effet sur les flows |
|---|---|---|---|
| `testID` d'une carte d'appli sans config | vide (`A/reducer/adapter.ts:146`) | `myapps-<name>` (`N/util.ts:19`) | `APP_WEB_TESTID` peut ne pas exister dans l'ancienne. Écart volontaire (fiche §9) : c'est l'ancienne qu'il faudrait corriger pour un oracle complet |
| Bouton valider de la modale des favoris | sans testID | `myapps-favorites-validate` | sélection / validation non testables sur l'ancienne |
| Bouton fermer de la modale des favoris | sans testID (`A/components/manage-favorite-modal/component.tsx:19`) | `BackButton` (`src/app/navigation-new/options.tsx:173` Android, `:125` iOS) | idem |
| Bouton retour d'un écran | `header-back` (`src/app/navigation/util.tsx:40`) | `BackButton` (`src/app/navigation-new/options.tsx:173`) | **changé** : non utilisé ici, cassera tout flow qui revient en arrière |
| Sous-titre du choix de plateforme | `network-welcome-version` (`AA/templates/platforms/screen.tsx:46`) | `network-welcome-subtitle` (`NA/sign-in/templates/platforms/screen.tsx:59`) | **changé** : évité, on attend `network-welcome-title` |
| Numéro de version sous les plateformes | `network-version-number` (`AA/templates/platforms/screen.tsx:57`) | absent | non utilisé |
| Loupe de la recherche | ni testID ni libellé (`A/components/my-apps-filters/component.tsx:94`) | `accessibilityLabel` « Rechercher », pas de testID (`N/components/my-apps-filters/component.tsx:96`) | recherche non couverte |
| Onglet Nouveautés | module `timeline` | module de test `amodule` avec le même testID | la barre d'onglets diffère à l'image |

## 3. `testID` manquants à ajouter au code

Par ordre de blocage. Les noms suivent les préfixes existants.

| # | Où | Composant | Nom proposé | Débloque |
|---|---|---|---|---|
| 1 | `N/components/my-apps-filters/component.tsx:95` (ancienne : `A/…/component.tsx:94`) | `Pressable` de la loupe | `myapps-search-open` | flow de recherche (fiche §3.2) |
| 2 | `src/framework/components/search-bar` (aucun `testID` dans le composant, deux générations) | `SearchBar` : prop `testID` à ajouter et à transmettre au champ | `myapps-search-input`, et `myapps-favorites-search-input` dans la modale | recherche, recherche dans la modale (§3.3) |
| 3 | `N/components/my-apps-filters/component.tsx:119` (ancienne : `:114`) | `SmallActionText` « Annuler » | `myapps-search-cancel` | fermeture de la recherche |
| 4 | `A/components/manage-favorite-modal/component.tsx:28` | `NavBarAction` valider (accepte déjà `testID`) | `myapps-favorites-validate` | validation groupée des favoris sur l'ancienne (§3.3) |
| 5 | `A/components/manage-favorite-modal/component.tsx:19` | `NavBarAction` fermer | `BackButton` (aligné sur la nouvelle) | fermeture et confirmation de sortie (§3.3, §4 n° 11) |
| 6 | `N/screens/favorites/index.tsx:52` (ancienne : `A/…/manage-favorite-modal/component.tsx:69`) | conteneur de l'écran | `myapps-favorites-screen` | repère de la modale commun aux deux générations |
| 7 | `NA/requirements/templates/terms/screen.tsx:76` (ancienne : `AA/screens/requirement-terms.tsx:132`) | `PrimaryButton` « Accepter » | `terms-accept` | connexion indépendante de la langue |
| 8 | `N/screens/app-actions.tsx:36` et `N/screens/favorites/hooks.ts:67` (ancienne : `A/screens/useController.ts:195`) | `Toast.showSuccess(…, { testID })` (option déjà gérée, `src/framework/components/toast/index.ts:20`) | `myapps-favorites-toast-success` | attente du toast sans texte |
| 9 | `N/screens/sheet.tsx:45` (ancienne : `A/screens/myapps-home-screen.tsx:264`) | conteneur de la feuille | `myapps-menu-sheet`, `myapps-app-actions-sheet` | fermeture et capture ciblée (`cropOn`) des feuilles |
| 10 | `N/components/my-apps-list/component.tsx:67` | `FlashList` ; séparateur `:27` | `myapps-list`, `myapps-separator-other-services` | capture de la liste seule, vérification du regroupement « Autres services » (§3.2) |
| 11 | `N/components/my-apps-card/component.tsx:70` | badge favori (toujours rendu, animé) | état lisible : `accessibilityState={{ selected: isFavorite }}` sur la carte, ou `myapps-<name>-favorite` rendu seulement si favori | vérifier l'étoile sans passer par le filtre Favoris (§4 n° 6) |

## 4. Replis sur un texte affiché (fragiles : langue, données)

| Flow | Texte | Pourquoi pas un `id` | Fragilité |
|---|---|---|---|
| `00-connexion` | `Accepter` | bouton sans testID (manquant n° 7) | langue ; étape optionnelle |
| `myapps-03` | `Redirection sur le navigateur` | alerte native du système | langue |
| `myapps-03` | `Annuler` | alerte native du système | langue ; casse possible sur Android |
| `myapps-04` | `Ajouter l'appli aux favoris` | le `testID` est le même dans les deux états | langue ; état des favoris du compte |
| `myapps-04` | `Retirer l'appli des favoris` | idem | idem |
| `myapps-04` | `Vos modifications ont bien été enregistrées` | toast sans testID (manquant n° 8) | langue ; étape optionnelle |

Dépendants des données du compte, bien que par `id` : `network-${PLATFORM_NAME}`, `${APP_TESTID}`,
`${APP_WEB_TESTID}`, et la regex « au moins une carte ».
