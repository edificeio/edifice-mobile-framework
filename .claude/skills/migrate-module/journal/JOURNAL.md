# Journal des sessions

Entrées les plus récentes **en tête**. Une entrée par session, même courte. Format :

```
## AAAA-MM-JJ — <sujet> (<branche>)
- Fait :
- Décidé :
- En suspens :
- Prochaine étape :
```

---

## 2026-11-19 — Assainissement de `support`, tous les sujets (`feat/ia/migration-outillage`)

- Fait : premier passage de `/sanitize-module`, par un agent, sur `src/framework/modules/support`, en huit patchs non commités (`sanitize-patches/01` à `08`) : `connect` (avec `try-action` et le reducer `ticket` mort : plus de Redux dans le module) ; `structure` en deux PR (service : `service/api.ts`, `service/adapter.ts`, `getModuleTransport('support').accountFetch` ; puis `model/` avec `business.ts` et `actions.ts`, `rights.ts` supprimé) ; `performance` ; `styles` (équivalents exacts seulement) ; `dette` (texte de l'alerte de sortie, libellé des catégories par « Mes applis ») ; patch du framework (`nativeInfo` du `LocalFile` de `src/framework/util/fileHandler/index.ts`) ; `erreurs` (absorbé). Fiche [support.md](support.md) §5, §6, §9.
- Décidé (utilisateur) : `droits` et `ui` abandonnés ; `connect` + `try-action` + Redux mort en une PR ; `structure` en deux PR ; pas de nouveaux flows Maestro, recette par PR dans la fiche ; `accountFetch(session, …)` ; `actions` de `BottomMenu` jamais mémoïsées ; patch du framework pour `LocalFile` ; styles : équivalents exacts seulement ; texte de l'alerte et libellés des catégories corrigés ; `PageView` / `KeyboardPageView` et `DropDownPicker` notés.
- Décidé seul (à relire) : `SyncedFileWithId` de `~/framework/util/fileHandler` dans tout le module dès `connect` (sans le cast de `mapDispatchToProps`, l'autre classe donnait une erreur nouvelle) ; types `TicketDraft` et `TicketAttachment` dans `model/index.ts` dès la PR du service ; `actions.ts` en fonction async simple (`sendSupportTicket`), le module n'ayant plus de store ; condition Android du style de la liste des catégories gardée dans l'écran (un `Platform.select` dans `styles.ts` aurait mis `position: undefined` sur iOS).
- Vérifié : `tsc` 778 → 770, aucune erreur nouvelle par fichier et par code (−5 dans le module, −3 ailleurs grâce au patch du framework) ; ESLint du dossier 0 ; Jest 431 → 447 ; `yarn migration-status --check` vert à chaque patch ; `testID` inchangés. **Pas testé dans l'app.**
- En suspens : relecture des huit patchs ; recette par patch dans l'app (fiche §9) ; les deux classes `LocalFile` / `SyncedFileWithId` du framework (`fileHandler/index.ts` et `fileHandler/models`) restent.
- Prochaine étape : relire, jouer la recette, puis commiter un patch par PR.
- Ensuite (utilisateur) : les huit patchs appliqués à l'arbre de travail (la fiche reprise du worktree, qui avait déjà la bonne phrase sur `hasRight`) ; `screens/create-ticket/types.ts` supprimé (un seul type, utilisé par un seul fichier). Retours de l'essai intégrés aux skills : mode « plan d'ensemble » (`/sanitize-module <chemin> tous`), ordre par défaut des sujets, statuts `absorbé par <sujet>` et `sans objet`, base `tsc` d'un sujet = état après le précédent, mesures dans le scratchpad, `yarn migration-status` seulement en fin de session, total de `yarn lint-all` comparé à la base, une entrée de JOURNAL par session ; CONVENTIONS : actions qui **reçoivent la session** en paramètre (décidé), dossier d'un écran (avec template : un fichier ; sans template : `screen.tsx` + `index.ts` qui réexporte, décidé), droits par fonction dans `model/business.ts`, section « Styles » (équivalents exacts, style de plateforme dans le JSX), mock Jest d'un service exporté par défaut ; `framework.md` : `PageView`, `BottomMenu`, les deux classes `LocalFile` ; `inventaire.md` : recettes de vérification ; gabarit : §5 « Backlog » / « Noté, non traité », colonne « Recette » en §9 ; `cli/migration-status.js` ne compte plus les tests (`support` : 534 lignes). La doc de migration n'est pas formatée par Prettier (décidé).
- Ensuite (utilisateur) : le fichier des types de l'API d'un service s'appelle `service/types.ts`, jamais `service/api.ts` (fichier de types du dossier, CONVENTIONS « Types »). `src/modules/myapps/service/api.ts` et `src/framework/modules/support/service/api.ts` renommés `types.ts`, imports corrigés ; CONVENTIONS, `sanitize-module`, `inventaire.md`, `modules-de-reference.md` et les fiches (`myapps`, `support`, plans de `wiki`, `explorer`, `user` : plus de renommage `types.ts` → `api.ts`) mis à jour.
- Ensuite (utilisateur) : dans `support`, `PageView` remplacé par un fragment (le layout de la nouvelle navigation donne déjà fond, taille et `ErrorBoundary`), `KeyboardPageView` par `KeyboardAvoidingView` (`~/framework/components/keyboard`, iOS seulement comme avant), `pageGutterSize` par `UI_SIZES.spacing.medium`. Règle écrite dans `framework.md` et le sujet `dette` de `sanitize-module`. Vérifié : `tsc` 770, rien dans `support` ; ESLint du dossier propre ; Jest 16/16. **Pas testé dans l'app** : la marge du bas sur iOS (le `SafeAreaView` de `KeyboardPageView` disparaît).
- Ensuite (utilisateur) : `docs/ARCHITECTURE.md` (les deux générations) fusionné dans `.claude/docs/ARCHITECTURE.md` (qui ne décrivait que l'ancien système), numérotation des sections gardée (les fiches et les skills citent §2, §3.2, §6) ; `AGENTS.md` (inexistant) remplacé par `CLAUDE.md` ; §7 renvoie aux vrais documents. Dossier `docs/` retiré : les autres fichiers étaient vides (`TESTS.md` : « Pas de tests. »). Liens mis à jour (`CLAUDE.md`, INTENT, `framework.md`, `journal/README.md`) ; aucun lien cassé.
- Ensuite (utilisateur) : INTENT revu et réécrit sans détails techniques (pourquoi, quoi, comment, quand ; les gestes renvoient à BASCULE, les sujets à `sanitize-module`). Ajouts : la raison des deux étapes et de la migration sur place ; « la migration ne change rien pour les utilisateurs, un changement visible ne vient qu'avec l'assainissement, validé ». Retirés : identifiants de code, listes d'API, dates de décision, notice du script (reportée dans `migrate-module/SKILL.md`, « Le suivi calculé »). Numéros des §4 et §8, cités ailleurs, gardés.
- Ensuite (utilisateur) : INTENT §4 « En profiter pour relever bugs et défauts de conception » et règle §5.3 « tout noter » : propre au module → fiche §5 (corrigé en assainissement) ; au-delà ou plus tard → `later.md`, nouvelle table « Bugs et défauts de conception relevés », remplie avec les 5 relevés de la session (`BottomMenu`, classes de fichiers en double, `auth`, carrousel de `media`, `SCREENS.md`). Consigne ajoutée aux deux skills.

## 2026-11-19 — Revue de `support`, deux skills (bascule / assainissement), suivi déplacé (`feat/ia/migration-outillage`)

- Fait : revue de `support` face au nouveau framework et confrontation du skill `migrate-module` avec INTENT / BASCULE (issus d'une formation). `docs/migrations/` déplacé dans le skill : règles à la racine de `.claude/skills/migrate-module/`, suivi et gabarits dans `journal/` ; copie en double `docs/migrations/migration-status.js` supprimée ; chemins corrigés (`cli/migration-status.js`, `.maestro/`, `docs/ARCHITECTURE.md`, un commentaire de `src/modules/notifications/hooks.ts`). INTENT, BASCULE (17 gestes), CONVENTIONS, gabarit de fiche (§9 « Assainissement »), `later.md` réécrits. `migrate-module` réécrit pour la bascule seule ; nouveau skill `sanitize-module` (un sujet par PR, phases d'une réécriture complète). `support` aligné : route `support/create-ticket`, `useConfirmRemove`, `ToDo(support-migration)` sur les imports de `workspace`. Compteur : `~/framework/navigation` compté, `setOptions` seulement avec un contenu ancien, `bascule incomplète` seulement pour la navigation ancienne ou l'import des routes d'un module ancien.
- Décidé (utilisateur) : deux skills, bascule puis assainissement ; dans la bascule, tout ce qui ne marche pas dans la nouvelle navigation (`setOptions` en entier, `usePreventBack` → `useConfirmRemove`, routes renommées `<module>/<dossier de l'écran>`, suffixe de la route d'accueil demandé au développeur) ; conversions d'UI en assainissement ; **plus de passage de Redux à zustand** (exception `user` gardée) ; sur place, jamais de déplacement vers `src/modules/` sauf dossier existant ; façade pour les importeurs de `module-config.ts` / `navigation/` ; `setOptions` permis avec les nouveaux items pour un bouton qui dépend de l'état ; import du code d'un module ancien permis avec `ToDo`, navigation ou state : arrêt ; Maestro recommandé, pas bloquant ; module ajouté au registre quelle que soit la marque (liste par marque dans `later.md`) ; tout le suivi dans le skill `migrate-module`.
- Vérifié : `tsc` 778 erreurs, identiques par fichier et par code avant / après (le texte de certaines erreurs d'autres modules change : il cite l'union des routes) ; ESLint sur `support` : 3 erreurs, 3 avertissements, les mêmes ; `yarn migration-status --check` vert après régénération (navigation ancienne 219 → 238 : nouvelle règle de comptage, pas du code nouveau) ; `myapps` et `support` passent `basculé, testable` ; aucun lien Markdown cassé dans les fichiers déplacés. **Pas testé dans l'app** (route renommée, `useConfirmRemove`).
- En suspens : `auth` importe encore `~/app/navigation/types` ; `media` (carrousel) masque ses boutons par `setOptions({ headerLeft, headerRight })`, signalé par la nouvelle règle ; `.claude/rules/SCREENS.md` et `CLAUDE.md` §5 décrivent la création d'écran à l'ancienne ; le commit `4307c0738` (`chore(support)`) touche aussi `src/app/store/index.tsx`.
- Prochaine étape : relire les deux skills ; rejouer `support-01` et la recette de `support` dans l'app ; premier vrai essai de `/migrate-module` sur un module.
- Ensuite (utilisateur) : ajouts aux deux skills. Bascule : geste 18, `withSession` (`~/modules/auth/hoc`) sur **tout** écran qui lit la session (`getSession()` / `assertSession()`, `sessionScreen`, ancien chemin de `withSession`), appliqué à `support` (session passée à `mapStateToProps`). Assainissement : nouveaux sujets `try-action` (supprimer `tryAction`, tracking gardé), `performance` (`useCallback` / `useMemo`), `styles` (styles statiques dans `styles.ts`), `erreurs` (`tsc` / ESLint du modèle et du reste du code) ; `api-publique` élargi (types, hooks, utilitaires). Pendant la bascule, DESIGN-SYSTEM et les règles d'écriture de COMPONENTS / SCREENS ne s'appliquent pas au code porté (CONVENTIONS « Portage »). Vérifié : `tsc` 778, identiques par fichier et par code ; ESLint `support` 2 erreurs, 3 avertissements. **Pas testé dans l'app.**
- Ensuite (utilisateur) : sujet `try-action` corrigé : l'option `track` est supprimée avec `tryAction`, sans appel de remplacement à `Trackers`, qui n'est plus compatible avec la stack Firebase. Remplace « tracking gardé » de la ligne précédente.

## 2026-11-19 — Intention, suivi calculé, tests Maestro, bascule de `support` (`feat/ia/migration-outillage`)

- Fait : [INTENT.md](../INTENT.md) (contexte, migration en deux étapes, règles de conduite, définition de « terminé ») ; [BASCULE.md](../BASCULE.md) (patron de l'étape 1) et [\_template-bascule.md](_template-bascule.md) ; `yarn migration-status` (`cli/migration-status.js`) qui génère [SUIVI.md](SUIVI.md) et `suivi.json`, avec `--check` qui échoue si un compteur de l'ancienne génération augmente ; suite Maestro dans `.maestro/` (connexion, six flows `myapps`, guide), script `yarn e2e` ; bascule de `support` sur place ([support.md](support.md)) : 11 fichiers, +47 / −79.
- Décidé : rien. Tout ce qui est écrit ici est une proposition à relire ; les choix pris pour `support` sont des choix par défaut ([support.md](support.md) §6).
- Vérifié : `yarn migration-status` (8 modules sur 41 sur la nouvelle génération, 97 écrans anciens) ; `tsc`, ESLint et Jest sur `support` le 2026-11-18, avant sa remise sur place. **Pas testé dans l'app. Aucun flow Maestro n'a tourné.**
- En suspens : `support` importe l'ancien `workspace` pour l'envoi des pièces jointes (aussi importé par `blog`, `homework`, `mails`, `user`) ; `support` n'a aucun `testID` ; trois `testID` ont changé avec la migration (`header-back` → `BackButton`, `network-welcome-version` → `network-welcome-subtitle`, `network-version-number` disparu), à l'encontre de la règle « `testID` inchangés ».
- Prochaine étape : faire passer `.maestro/flows/00-connexion.yaml` puis `myapps-01-liste.yaml` sur un build de l'ancienne génération ([.maestro/README.md](../../../../.maestro/README.md)) ; jouer `support` dans l'app ; trancher les questions ouvertes de [support.md](support.md).

## 2026-11-18 — Révision de la cible d'`explorer` (`feat/navigation`)

- Fait : [explorer.md](explorer.md) §1, §3, §4 n° 4 et 10, §5, §6 (phases 2 à 4), §7 ; [wiki.md](wiki.md) §5.1, §5.2, §7. Aucun code modifié.
- Décidé (utilisateur) : `explorer` garde dans **son** store (`state.explorer`) l'inventaire des dossiers et ressources **par app** (nom ENT : `Wiki`, `Blog`, `Cahier de texte`, `Cahier Multimédia`) ; API publique en **fonctions qui prennent l'app** (`loadExplorerPage`, `selectExplorerFolder`, `resourceExplorerScreenOptions`, prop `app` du template), pas de fabrique ; contexte de l'API (`application` / `resource_type`) dans le service d'`explorer`. Remplace « un slice par consommateur ». Flux des noms d'apps détaillé ([explorer.md](explorer.md) §5.4) : l'ancien nom (`wiki`) ne sort pas du service ; `appName` d'une ressource = nom ENT de l'app demandée (`item.application` non lu).
- Vérifié : rien à lancer (documentation seule).
- En suspens : validation du plan ; règle « mapping de noms d'apps hors de l'adapter de l'API = anti-pattern » proposée pour CONVENTIONS, sans réponse.
- Prochaine étape : phase 1 (déplacements) d'`explorer`, après validation.

## 2026-11-17 — Spécification d'`explorer` (`feat/navigation`)

- Fait : fiche [explorer.md](explorer.md) (inventaire, consommateurs `wiki` / `blog` / `homework` / `scrapbook`, dépendances, comportements, cible, plan en 5 phases). Override `dev/default` gardé (déjà actif). Aucun code modifié.
- Décidé (utilisateur) : sur place ; `CoreModule` sans `redux` (state par consommateur, fabrique préfixée par son nom) ; sous-dossier par callback `onOpenFolder` ; titre lu dans le store depuis la fonction `options` de `defineScreen` ; **pas de façade** (ancien template et anciennes fabriques supprimés, les 4 consommateurs cassent jusqu'à leur migration) ; conversion des noms d'apps de `/explorer` dans l'adapter d'`explorer`, `newEntAppNameFromOldMap` retiré d'`intents.ts` (un mapping de noms d'apps hors de l'adapter de l'API qui l'impose est un anti-pattern) ; corrections §4 n° 6, 7, 8.
- Vérifié : base tsc 776 (5 dans `explorer`, orphelin `model/index.ts`), eslint 2 090 / 88, `yarn test` 431/431.
- En suspens : validation du plan.
- Prochaine étape : phase 1 (déplacements) d'`explorer`.

## 2026-11-17 — Spécification de `wiki` (`feat/navigation`)

- Fait : fiche [wiki.md](wiki.md) (inventaire, consommateurs, dépendances, comportements, cible, plan par phases). Override `dev/default` appliqué par le skill. Aucun code modifié.
- Décidé (utilisateur) : migration sur place ; `explorer` puis `audience` migrés d'abord, migration de `wiki` **arrêtée** en attendant ; orphelins non portés (`wiki/create`, `image-input`, `resource-thumbnail-loader`, pas de `fileManager`) ; corrections §4 n° 3, 4, 7 ; `testID` de l'en-tête abandonnés au profit du header du framework ; **jamais `headerTitle`** pour un titre lu dans le store (perd le titre natif).
- Vérifié : base tsc 776 erreurs (22 dans `modules/wiki`), eslint 2 090 / 88, `yarn test` 431/431.
- En suspens : question 7 de la fiche (moyen d'afficher un titre lu dans le store sans `headerTitle`) ; validation du plan.
- Prochaine étape : `/migrate-module src/framework/modules/explorer`, puis `audience`, puis reprise de `wiki`.

## 2026-11-17 — Points d'entrée `entries` et clé `fileManager` (`feat/navigation`)

- Fait : phase 0 du plan de `user`, à part : `ModuleConfig.entry` / `tab` remplacés par `entries` (`myApps`, `tab`, `userMenu`), `route` obligatoire sans params ; `getUserMenuEntries` / `useUserMenuEntries` pour les liens de l'accueil de `user` ; clé `fileManager` enregistrée au chargement des modules. `myapps`, modules de test, tabs, `useOpenModule` adaptés. Doc : ARCHITECTURE, [myapps.md](myapps.md), [user.md](user.md) §9, signaux du skill. Détail dans [user.md](user.md) §9.
- Décidé (utilisateur) : **migration de `user` reportée** ; seules ses évolutions du framework sont faites maintenant.
- Vérifié : tsc 776 (inchangé), eslint 2 090 / 88 (inchangé), `yarn test` 431/431 (+3). **Pas testé dans l'app.**
- En suspens : test dans l'app (onglets, ouverture des modules depuis « Mes applis ») ; champs d'un lien `userMenu` gardés comme proposés (à revoir avec le premier consommateur).
- Prochaine étape : tester dans l'app ; reprise de `user` à la phase 0 bis.

## 2026-11-17 — Spécification de `user` (`feat/navigation`)

- Fait : premier essai du skill `migrate-module`. Fiche [user.md](user.md) : inventaire de `framework/modules/user` (écrans, consommateurs, dépendances), comportements à conserver, cible, plan par phases. Override `dev/default` appliqué par le skill. Aucun code modifié.
- Décidé (utilisateur) : écrans des notifications push hors périmètre (repris par `notifications`, supprimés au nettoyage) ; points d'entrée des modules regroupés dans `entries` (`myApps` ex-`entry`, `tab`, `userMenu` = tableau de liens dans l'accueil de `user`, `create` plus tard), `route` obligatoire et sans params ; emplacement `src/modules/user` ; store Redux des profils ; clé `fileManager` dans `ModuleConfig` ; alerte « heures calmes » portée ; « Envoyer un message » masqué ; `debug` et `splashads` migrés d'abord ; `birthdate` en `Temporal`.
- Vérifié : base tsc 776 erreurs (39 dans `modules/user`), eslint 2 090 erreurs / 88 warnings, 428 tests.
- En suspens : validation du plan ; champs d'un lien `userMenu` à confirmer en phase 0.
- Prochaine étape : phase 0 (`entries`, `fileManager`) après accord sur le plan.
- Ensuite (utilisateur) : skill `migrate-module` mis à jour avec les décisions de ce plan : `entries` et `fileManager` (inventaire, signaux de `framework.md`, phase 3), module déjà commencé dans `src/modules/` → on continue là, phase « 0 bis » pour les modules à migrer d'abord, nettoyage du code orphelin et hors périmètre, questions de forme quand une réponse ouvre une évolution du framework, valeurs renvoyées par params → store, `Temporal` recommandé.
- Retours (utilisateur) sur le skill : l'emplacement du module est **toujours demandé** (pas de règle « on continue dans `src/modules/` ») ; migrer d'abord un autre module est **toujours demandé**, et s'il est gros, le skill propose d'arrêter la migration en cours pour faire le préalable d'abord.
- Relecture (utilisateur) : store des profils de `user` en **zustand** (`createSessionStore`) au lieu de Redux (fiche §4 n°4, §5, §7) ; plus de clé `redux` dans la config de `user`.

## 2026-11-16 — Skill `migrate-module` (`feat/navigation`)

- Fait : skill `.claude/skills/migrate-module/` (lancé à la main) : préparation, inventaire du module, état des dépendances transverses, fiche + plan par phases, exécution phase par phase avec relecture. Registre des modules de référence (`myapps`, `auth`), enrichi à la main après relecture. Mention dans [README.md](README.md). Aucun code modifié.
- Décidé (utilisateur) : un module migré reste dans `src/framework/modules/` sauf réécriture quasi complète ; le développeur prend les décisions, le skill propose.
- En suspens : skill pas encore essayé sur un module.
- Prochaine étape : premier essai sur un module (relecture du skill au passage).

## 2026-11-11 — Détails de `GET /api/me/applications` (`feat/ia/vmou`)

- Décidé (utilisateur) : on ne change rien, comme le client web (détection des bibliothèques par l'adresse, `libraries` et `isExternal` ignorés, pas de repli sur les anciennes routes).
- Fait : sujet retiré de [later.md](later.md) ; [myapps.md](myapps.md) mis à jour (§3.1, §5.3, décisions, §9). Aucun changement de code.
- Ensuite (utilisateur) : les 3 commentaires qui renvoyaient à ce sujet de `later.md` disent maintenant que c'est voulu, comme le client web (`model/classification.ts`, dont le `ToDo(myapps-migration)` retiré ; `service/api.ts` : `isExternal`, `libraries`). Aucun changement de comportement.

## 2026-11-11 — Recherche de `MyAppsFilters` (`feat/ia/vmou`)

- Décidé (utilisateur) : pas de barre de recherche native du header ; la recherche de `MyAppsFilters` reste telle quelle, elle suit le design fourni. Aucun changement de code.
- Fait : sujet retiré de [later.md](later.md) ; [myapps.md](myapps.md) §4 n° 13 et décisions mis à jour.

## 2026-11-10 — Clé i18n du libellé d'un onglet (`feat/ia/vmou`)

- Décidé (utilisateur) : `tab.labelI18n` facultatif ; ordre : sa traduction, sinon `appName` de l'app du module (`myapps`), sinon `name` ; règle isolée dans une fonction.
- Fait : `ConfigForTab.labelI18n`, `getTabLabel` (dans `src/app/navigation-new/tabs.tsx`, à la demande de l'utilisateur ; sans test, Jest ne chargeant pas `tabs.tsx`), utilisé par `TabLabel` et l'ancienne `main-navigation`. Doc : ARCHITECTURE §2.3, §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 411/411. **Pas testé dans l'app.**

## 2026-11-10 — Libellés des apps et des onglets : `appName` (`feat/ia/vmou`)

- Décidé (utilisateur) : afficher uniquement `appName` (traduit par le serveur selon `Accept-Language`), tabBar comprise ; plus de traductions locales ni de règles de correspondance. Le changement de langue redémarre l'app (`sessionSetup` relancé) ; cas ajouté dans [later.md](later.md).
- Fait : `EntApp.label` = `appName` ; `getAppLabel`, `getModuleLabel`, `Translate` et la plomberie `translate` supprimés ; libellé d'un onglet = celui de son app, sinon le nom du module. Sujet « Libellés de tous les onglets » retiré de `later.md`. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 411/411 (7 tests des règles supprimées retirés). **Pas testé dans l'app.**

## 2026-11-10 — Libellé de l'onglet `myapps` (`feat/ia/vmou`)

- Décidé (utilisateur) : `matchEntcoreApp: 'Portal'` sur `myapps` (droit universel, toujours renvoyé par le serveur) ; sujet retiré de [later.md](later.md).
- Fait : `hasRight: () => true` retiré ; `getModuleLabel` normalise les noms pour la clé i18n (`myapps-app-portal`), alias supprimé. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-10 — `myapps` phase 7 : nettoyage (`feat/ia/vmou`)

- Fait : suppression de `src/framework/modules/myapps` (plus aucun import extérieur) et de la modale `ModalsRouteNames.FavoritesManagement` de l'ancienne navigation. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 767 (−10, code ancien supprimé), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : tester `myapps` (phases 4 à 6) dans l'app ; module suivant selon STATUS (`user`).

## 2026-11-10 — « Scroll to top » sur appui du header (iOS 27) (`feat/ia/vmou`)

- Constaté : depuis iOS 27 sur iPhone (iPadOS 26), UIKit remonte le contenu de l'écran quand on appuie sur la barre de navigation (titre, zone vide : voulu par Apple). Les items natifs consomment l'appui, pas les vues React du header (pas de gesture recognizer) : appuyer sur un bouton `custom` remontait la liste. Indépendant de la liste (ScrollView, FlatList, FlashList). Problème connu : facebook/react-native#56061.
- Fait : `ScrollToTopGuard` (`react-native-screens/experimental`) autour des éléments React des items iOS du header (`navigation-new/header/index.tsx` : `headerCustom` et boutons à icône SVG). Son natif n'est compilé qu'avec le projet « gamma » de react-native-screens : le patch de react-native-screens compile maintenant `ios/gamma/scroll-to-top-guard/` seul (podspec) et retire son stub (`RNSGammaStubs`). `pod install` fait ; build iOS Debug réussi. `scrollsToTop` laissé par défaut (appui sur la barre d'état et le titre conservés).
- Remarque : `patch-package` ne sait pas régénérer le patch avec yarn berry (`--ignore-scripts` refusé) : les diffs ont été ajoutés à la main au fichier de patch (vérifié par `git apply --check -R`).
- **Pas testé dans l'app** (test par l'utilisateur) : sur iOS 27, un appui sur un bouton du header ne doit plus remonter la liste, un appui sur le titre ou la barre d'état si.

## 2026-11-10 — `myapps` phase 6 : ouvrir une app (`feat/ia/vmou`)

- Fait : `useOpenApp()` (module ouvrable, sinon `openUrl(getAppUrl(…))`), appelé par `MyAppsHomeScreen` ; `getAppModules` ne garde que les modules dotés d'une `entry` (carte cohérente avec l'ouverture). Détail : §9 de [myapps.md](myapps.md).
- Constaté : aucun module nouveau n'a de `matchEntcoreApp`, donc toutes les apps s'ouvrent dans le navigateur pour l'instant.
- Vérifié : tsc 776, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : tester les phases 4 à 6, puis phase 7 (nettoyage).

## 2026-11-10 — Items du header complets (`feat/ia/vmou`)

- Décidé (utilisateur) : items de react-navigation (`unstable_header*Items`) comme contrainte, les quatre types (button, menu, spacing, custom) ; champs communs aux deux plateformes, ceux d'iOS dans `ios` ; `testID` obligatoire sur chaque action et chaque entrée de menu ; icône SVG (rendue en React) ou paire `{ ios, android }` (natif sur iOS) ; espacement fixe `spacing.minor` ; helpers `headerAction()`, `headerMenu()`, `headerSpacing()`, `headerCustom()` (+ `menuAction()`, `menuSubmenu()` pour les entrées).
- Fait : `src/app/navigation-new/header/` (`types.ts`, `items.ts`, `menu.ts` + test, `components.tsx`, `index.tsx`) ; menus Android (et iOS avec icône SVG) par `MenuView` de `@react-native-menu/menu`, entrée identifiée par son `testID`. Appelants : `myapps` (accueil en `headerCustom`, favoris : bouton natif `checkmark` / `ui-check`), `amodule` (avatar + vitrine des quatre types). Doc : ARCHITECTURE §3.2, CONVENTIONS.
- Constaté : native-stack inverse lui-même l'ordre des items de droite pour iOS (rien à faire) ; react-native-screens ne donne pas d'identifiant aux entrées d'un menu natif iOS (`identifier:nil`) : leur `testID` y est sans effet (suivi possible : étendre le patch).
- Vérifié : tsc 776, eslint propre, `yarn test` 418/418 (4 nouveaux). **Pas testé dans l'app** : vitrine d'`amodule` à vérifier sur iOS et Android.
- Ensuite (utilisateur) : `headerRightActions` liste ses items **de droite à gauche** (le premier au bord de l'écran, comme `rightBarButtonItems` d'UIKit) ; `headerLeftActions` de gauche à droite. Appelants remis dans cet ordre (`myapps` : menu au bord, comme l'ancien écran).
- Ensuite : bouton texte seul sur Android (marge de 12dp, une ligne, ripple sur tout le bouton) ; « Modifier » dans la vitrine d'`amodule`.
- Ensuite (utilisateur) : header du carrousel de `media` (`screens/carousel/navbar.tsx`) passé aux items : menu natif « options » (entrée « partager », `ellipsis` / `ui-options`) au bord, puis « télécharger » (`arrow.down.to.line` / `ui-download`), natifs sur iOS. `PopupMenu` et l'ancien `headerAction` n'y servent plus. `media-navbar-share` est maintenant le `testID` de l'entrée du menu (avant : l'enveloppe du bouton) ; le menu s'ouvre par `media-navbar-options`. Libellé du menu pour les lecteurs d'écran : « Partager » faute de traduction de « options » (`ToDo(media)`). L'ancien carrousel (`framework/components/carousel`, ancienne navigation) n'est pas touché. tsc 776, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-09 — Boutons du header dans `navigation-new` (`feat/ia/vmou`)

- Fait : `src/app/navigation-new/header.tsx` : `headerLeftActions(...actions)` / `headerRightActions(...actions)` donnent les champs d'un côté pour les deux plateformes (Android `headerLeft` / `headerRight` en ligne, boutons de 48dp avec le ripple natif ; iOS un item `custom` par action). Une action = objet (`icon` : `SvgIconName` ou élément, `accessibilityLabel`, `testID`, `onPress`, `disabled`) ou fonction qui rend un composant à hooks affichant un `HeaderActionButton`. Règles reprises d'`amodule` et de `modalCloseButtonOptions`. Utilisé par `myapps` (accueil, favoris) et `amodule`. Doc : ARCHITECTURE §3.2, CONVENTIONS (conversions d'UI).
- Choix : bouton désactivé à demi-opacité ; marge de `spacing.minor` entre les boutons et le titre sur Android (comme la croix des modales).
- En suspens : `media/screens/carousel/navbar.tsx` utilise encore `headerAction` (bouton enveloppé dans un `PopupMenu`) ; libellés d'accessibilité des boutons onboarding / menu de `myapps` sans traduction (`ToDo(myapps-migration)`).
- Vérifié : tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app.**

## 2026-11-09 — `myapps` phase 5 : modales (`feat/ia/vmou`)

- Décidé (utilisateur) : le filtre de `myapps/home` devient un param (`{ filter? }`) pour que le bouton du menu le connaisse (le menu se réduit sur le filtre Favoris, comme l'ancien).
- Fait : `myapps/menu`, `myapps/app-actions` (`formSheet`), `myapps/favorites` (`defineModal`, `useConfirmRemove`), `myapps/onboarding` (`transparentModal`) ; `MyAppsMenuItem` ; onboarding automatique par le state de session ; boutons du header et appui long branchés ; §4 n° 4-9 et 11 faits ; `hasHelpUrl` supprimé. Détail : §9 de [myapps.md](myapps.md).
- Vérifié : tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app** (points à vérifier listés au §9).
- Prochaine étape : tester les phases 4 et 5 dans l'app, puis phase 6 (ouvrir une app).

## 2026-11-09 — Requêtes signées typées par les scopes d'un module (`feat/ia/vmou`)

- Décidé (utilisateur) : factory `getModuleTransport('<module>')` (« transport » plutôt que « fetch » : elle donne aussi les consommateurs d'API ; pas un hook : types seulement, appelable dans les services, thunks et hooks de session) ; opt-in, les appels existants ne changent pas ; les API dont le chemin ne commence pas par leur scope (`/api/me/applications`, sous `portal`) restent sur les fonctions du transport.
- Fait : paramètre de type `Scope` (7e, défaut `never`) sur `Module` / `CoreModule` / `EntModule` et leurs configs, `scope?: readonly Scope[]`, `ModuleScope<T>` ; `src/framework/util/transport/module-transport.ts` (`getModuleTransport`, `ModuleTransport`, `ScopedPath`) ; utilisé pour les préférences de `myapps`. Doc : ARCHITECTURE §2.3, CONVENTIONS « Données et état ».
- Vérifié : tsc 776 (aucune nouvelle erreur, pas de circularité de types), eslint propre, `yarn test` 414/414 (tests de types par `@ts-expect-error` dans `module-transport.test.ts`).
- En suspens : les sources d'images signées (`Image` de `media`) ne sont pas couvertes.
- Ensuite : module `auth` passé sur `getModuleTransport('auth')` (tous ses `tokenFetch` : `service/validation.ts`, `requirements.ts`, `userinfo.ts`, `token.ts`, chemins sous `auth`, `directory`, `userbook`). Ses `platformFetch` (non signés) ne changent pas. tsc 776, eslint propre, `yarn test` 414/414. **Pas testé dans l'app.**
- Ensuite : scope `portal` retiré d'`auth` (aucune requête d'auth dessous ; `myapps` le déclare, le jeton ne change pas). `infra` reste : seul module à le déclarer, utilisé par le tracker (`/infra/event/mobile/store`). `userinfo` : peut-être exigé par `/auth/oauth2/userinfo`, à tester avant de le retirer.

## 2026-11-07 — Rozenite : stores dans React Native DevTools (`feat/ia/vmou`)

- Fait : `@rozenite/metro` (Metro enveloppé par `withRozenite`, actif avec `WITH_ROZENITE=true`, script `yarn start:rozenite`), `@rozenite/redux-devtools-plugin` (enhancer en `__DEV__` dans `src/app/store`), `rozenite-zustand-devtools` (stores zustand listés dans `src/app/debug/devtools.ts`, hook dans `App`). Doc : ARCHITECTURE §6 bis.
- Vérifié : bundle iOS de dev avec Rozenite (2 plugins chargés), tsc 776, `yarn test` 413/413. **Pas testé dans les DevTools.**
- Ensuite : plugins React Navigation (`navigation-new/index.tsx`), Storage (MMKV de l'app, clés de secrets masquées), File System (`react-native-fs`) et Require Profiler (Metro + hook) ; hooks regroupés dans `useRozeniteDevTools` (`src/app/debug/devtools.ts`). Bundle de dev : 6 plugins chargés. Doc : ARCHITECTURE §6 bis.

## 2026-11-07 — `myapps` : suites de la revue du modèle (`feat/ia/vmou`)

- Décidé (utilisateur) : ouverture = module ouvrable sinon `/auth/redirect` (plus de distinction `web` / `connector`) ; `applications` transmis sans vérification ; modules typés `AllModulesNames` ; `EntApp.icon` et `User-Agent` gardés tels quels (on évite de transformer les données du serveur) ; `EMPTY_PREFERENCES` et palette du thème : pas de problème ; état « en cours » : hors périmètre.
- Fait : `ListedApp.hasModule` ; `toListedApps` + `filterApps` / `hasAppsToList` ; suppression de `AppOpeningStrategy`, `getAppOpeningStrategy`, `EntApp.isConnector`, `AppModule`. Détail : §8 et §9 de [myapps.md](myapps.md).
- Vérifié : tsc 776, eslint propre, `yarn test` 411/411. **Pas testé dans l'app.**
- Ensuite (utilisateur) : plus de signature manuelle de l'icône du workspace (`Image` signe) ; `getAppUrl` : pas de `/auth/redirect` pour une adresse de la plateforme.
- Prochaine étape : phase 5 (modales).

## 2026-11-07 — `myapps` : relecture de la phase 4 (`feat/ia/vmou`)

- Décidé : hooks d'un composant dans `hooks.ts` ; favoris dans l'ordre des préférences ; `ListedApp.opening` au lieu de `module` ; tablette hors sujet (`CLAUDE.md` créé).
- Fait : corrections de la revue (icônes en URL, séparateur FlashList 2, query des images, pictogramme web, accessibilité, clavier, mémoïsation, code mort). Détail : §9 de [myapps.md](myapps.md). Revue du modèle : 8 points fragiles en §8, à discuter.
- Vérifié : tsc 776, eslint propre, `yarn test` 423/423. **Pas testé dans l'app.**
- Prochaine étape : discuter les points du modèle (§8), puis phase 5.

## 2026-11-07 — `myapps` phase 4 : `MyAppsHomeScreen` (`feat/ia/vmou`)

- Fait : `src/modules/myapps/screens/home/` (écran + boutons du header en composants, options statiques) ; `components/` (`MyAppsList`, `MyAppsCard`, `MyAppsFilters`, `MyAppsFilterCell`, portés tels quels, anciens `testID` conservés) ; `filterApps` renvoie des `ListedApp` ; `hasAppsToList` / `useHasAppsToList`. Détail : §9 de [myapps.md](myapps.md).
- Choix d'implémentation : `useScrollToTop` ; recherche fermée à la perte de focus ; focus de la recherche sans délai (à vérifier).
- En suspens (`ToDo(myapps-migration)`) : appui sur une app (phase 6), appui long et boutons du header (phase 5).
- Vérifié : tsc 776 (aucune nouvelle), eslint propre, `yarn test` 422/422. **Pas testé dans l'app.**
- Prochaine étape : phase 5 (modales).

## 2026-11-07 — Contrainte pour `timeline` : notifications à part (`feat/ia/vmou`)

- Décidé : les notifications sortent de `timeline` dans le module `notifications`, consommé par `timeline` et par le futur module `home` (développé par ailleurs), qui ont tous deux un fil de notifications.
- Fait : fiche [timeline.md](timeline.md) (contrainte, §5.1) ; question d'architecture n° 1 de [STATUS.md](STATUS.md) complétée.
- Prochaine étape : phase 4 de `myapps`.

## 2026-11-06 — Icônes typées, puis annulé (`feat/ia/vmou`)

- Décidé : une icône `Svg` est typée `SvgIconName`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `EntAppDisplay.icon`, `DEFAULT_APP_ICON`, surcharges d'icônes de `myapps` et des notifications ; `getAppSvgIcon` (via `svgExists`) ; `media/resource-display` et `communities` sans cast.
- Constaté : `EntApp.icon` n'est pas toujours un `Svg` (image du workspace, URL : ancien `resolveAppIcon`) ; il reste une référence `string`, à traiter avec `MyAppsCard` en phase 4. Le modèle ne peut pas vérifier les noms (`svgExists`) : la liste des SVG ne se charge pas sous Jest (imports ESM) ; la vérification est dans les hooks.
- Vérifié : tsc 775 (aucune nouvelle), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- **Annulé** à la demande de l'utilisateur (le typage venait d'une erreur de sa part) : icônes de nouveau en `string`, règle « Icônes » retirée de CONVENTIONS. Au passage, `community-card-small` utilise `useModuleAppDisplay('communities')` (on est dans ce module) : tsc 776, erreur voulue.

## 2026-11-06 — `EntAppImage` et `ModuleImage` (`feat/ia/vmou`)

- Décidé : un composant par source du nom : `EntAppImage` (nom d'app ENT venu du serveur, `useEntAppDisplay`) et `ModuleImage` par-dessus (module connu du code, `AllModulesNames`). Règle « app ENT ou module » dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/framework/components/picture/ent-app-image/` (corps de l'ancien `ModuleImage`, styles déplacés) ; `module-image` réduit à `EntAppImage` + `useModuleAppName` (exporté par les hooks de `myapps`).
- Vérifié : tsc 775 (aucune nouvelle ; les 2 erreurs préexistantes du rendu de remplacement ont suivi le code), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**

## 2026-11-06 — Noms de modules typés (`feat/ia/vmou`)

- Décidé (utilisateur) : `useModuleAppDisplay`, `useModuleApp` et `useModuleAppName` n'acceptent qu'un `AllModulesNames` ; `ModuleWithRights` prend `Pick<AnyModule, 'name'>`. On ne doit pouvoir obtenir qu'un module qui existe. Dans les tests, les noms de modules restent fictifs (les modules de test `amodule`… disparaîtront) : on surcharge les types.
- Fait : `useModuleApp` / `useModuleAppName` typés ; `src/app/module/rights.test.ts` surcharge le type de `isModuleAvailableForUser` (nom quelconque).
- `ModuleImage` (`src/framework/components/picture/module-image`) prend une prop `moduleName: AllModulesNames` (ex-`appName: string`) ; ses appelants `wiki` passent `moduleName`.
- Conséquence : tsc 775 au lieu de 768. Erreurs **voulues** : 7 appels avec un module non migré (5 de `useModuleAppDisplay`, 2 de `ModuleImage` dans `wiki`), corrigés au fil des migrations. Ne pas les traiter comme des régressions.

## 2026-11-06 — Types rangés dans les fichiers de types (`feat/ia/vmou`)

- Décidé : un type utile à plusieurs fichiers va dans le fichier de types de son dossier (`types.ts`, `model/index.ts`…) ; un type interne reste dans son fichier, non exporté, voire sans nom. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/app/module/types.ts` (`ModulesMap`) ; `src/modules/myapps/model/index.ts` (`Translate`, `AppConfig`, `MyAppsFilter`) ; `src/modules/myapps/hooks/types.ts` (`MyAppsDispatch`, `EntAppDisplay`). Restés locaux : `LoadedModules`, `ModuleWithRights`, `LabelSourceData`, `FilterAppsContext` ; dépendances de `createMyAppsSessionHooks` sans nom.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418.
- Ensuite : `ModulesMap` → `AllModulesMap` (comme `AllModulesArray`) ; l'ancien type objet `AllModulesMap` → `AllModulesByName`.
- Puis : la Map devient un objet typé `AllModulesByName` (`useModulesByName()`, ex-`useModulesMap()` ; `getModuleByName` pour un nom quelconque) ; le type `AllModulesMap` est supprimé.
- Enfin : `AllModulesByName` → `AllModulesRecord`, `useModulesByName` → `useModulesRecord`. Le tableau des modules du contexte est en lecture seule (`Readonly<AllModulesArray>`, figé), comme `useModules()`.

## 2026-11-06 — Modules par nom en O(1) (`feat/ia/vmou`)

- Décidé : un module se lit par son nom dans une Map, pas par `modules.find(…)`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `ModuleContext` (`src/app/module/loader.tsx`) contient `{ modules, byName }`, construits une fois ; `useModulesMap()`, `useModule(name)` ; utilisés par `useModuleAppName` (`myapps`) et `src/app/navigation-new/open-module.ts`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — `myapps` : `useTabLabel` supprimé (`feat/ia/vmou`)

- Décidé : `useTabLabel` redondant avec `useModuleAppDisplay` (même libellé, écrit avant lui) : supprimé.
- Fait : `TabLabel` (`src/app/navigation-new/tabs.tsx`) lit `useModuleAppDisplay(module.name).label`.
- Vérifié : tsc 768, eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — Couleurs de la palette typées (`feat/ia/vmou`)

- Décidé : un nom de couleur de la palette est typé `ThemeColorName` (`keyof palette.complementary` + `primary` / `secondary`), pas `string`. Règle dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : `src/app/theme.ts` (`ThemeColorName`, `isThemeColorName`, `getThemeColorShades`) ; `myapps` (`EntApp.color`, `getAppColor` qui écarte une couleur inconnue, `getAppShades`) ; surcharges de `src/modules/notifications/hooks.ts`.
- Vérifié : tsc 768 (aucune nouvelle), eslint propre, `yarn test` 418/418. **Pas testé dans l'app.**
- Prochaine étape : phase 4 de `myapps` (écran).

## 2026-11-06 — `myapps` : relecture de la phase 3 (`feat/ia/vmou`)

- Décidé : `useEntAppDisplay(entAppName)` / `useModuleAppDisplay(moduleName)` → `{ colors: IShades, icon, label }`, couleurs **primaires** par défaut, au lieu de `useAppTheme` / `useAppBadge` ; un badge est un objet construit par l'appelant ; `useNotificationEntApp` (+ `useNotificationEntAppDisplay`) dans le module `notifications` ; `selectAggregatedApps` gardé seulement pour l'ancien code de `framework/modules/myapps` jusqu'à la phase 7.
- Fait : `src/modules/myapps/hooks/display.ts`, `src/modules/notifications/hooks.ts` ; consommateurs migrés (`module-image`, `blog`, `homework`, `news`, `communities` ×3, `timeline/notification-top-info`, `main-navigation`) ; façades `use-app-theme.ts`, `use-app-badge.ts` supprimées.
- Vérifié : tsc 768 (aucune nouvelle), eslint propre sur le nouveau code, `yarn test` 417/417. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 4 (écran).

## 2026-11-06 — `myapps` phase 3 : API publique (`feat/ia/vmou`)

- Fait : hooks `src/modules/myapps/hooks/` (`useEntApps`, `useEntApp`, `useAppModules`, `useModuleApp`, `useTabLabel`, `useFavorites`, `useShowAllApps`, `useFilteredApps`, `useAppTheme`, `useAppBadge`) ; règles `getModuleLabel`, `getAppModules` ; libellés des onglets dans `src/app/navigation-new/tabs.tsx` ; façades `@deprecated` de `framework/modules/myapps` (hooks et sélecteurs) réécrites sur le nouveau state ; `media/hooks/resource-display.ts` lit `useEntApp`. Détail : §9 de [myapps.md](myapps.md).
- Gardé tel quel : thème par défaut = les gris de l'ancien module (pas des nuances, `ToDo(myapps-migration)`) ; recherche par nom de module limitée aux modules chargés (les modules non migrés gardent le thème par défaut, comme avant).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 417/417. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 4 (écran).

## 2026-11-06 — `myapps` phase 2 : chargement (`feat/ia/vmou`)

- Fait : `src/modules/myapps/session.ts` (`createMyAppsSessionHooks`) : `sessionSetup` charge les apps (bloquant, écrit au `commit`), `onSessionStart` les préférences (échec → `status: 'error'`, rien d'écrit après la fin de la session). Branché dans `index.ts` (`getStore().dispatch`, `I18n.get`). `ToDo` retiré de `src/modules/auth/flows/start-session.ts`. Règle `session.ts` ajoutée à [CONVENTIONS.md](../CONVENTIONS.md) (choix de Claude, à valider).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 413/413. **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : tester la connexion dans l'app (state `myapps` dans Reactotron), puis phase 3.

## 2026-11-06 — `myapps` : relecture de la phase 1 bis (`feat/ia/vmou`)

- Décidé : règles du modèle regroupées par objectif (`model/display.ts`, `opening.ts`, `classification.ts`, `favorites.ts`, `onboarding.ts`) au lieu de `model/rules/` ; `filterApps` dans le modèle (`classification.ts`) ; `use-cases.ts` remplacé par `actions.ts` (actions de l'utilisateur : les thunks y passent) ; `store/actions.ts` → `store/action-creators.ts` (types d'actions et action creators Redux seuls). Règles générales mises à jour dans [CONVENTIONS.md](../CONVENTIONS.md).
- Fait : code et tests réorganisés en conséquence (aucun changement de comportement).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 408/408 (83 pour `myapps`). **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 2 (chargement).

## 2026-11-06 — `myapps` phase 1 bis : code conforme à la conception (`feat/ia/vmou`)

- Fait : `model/` (types seuls) + `model/rules/` (un fichier par règle, avec tests ; `business.ts` supprimé) ; `service/api.ts` (`namespace API`), `service/adapter.ts` (hydratation `toEntApps`, `toPreferences` / `fromPreferences`) ; store `apps` + `preferences.favorites`, `refreshMyApps({ translate })` ; `filterApps(apps, filter, { favorites, getModule, showAllApps })` avec filtre `display` et tri. Framework : `isModuleAvailableForUser`, `useUserAvailableModules`. Détail : §9 de [myapps.md](myapps.md).
- Corrigé : les apps `display: false` sont gardées (elles étaient filtrées à la réception).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre (hors erreur préexistante de `loader.tsx`), `yarn test` 408/408 (83 pour `myapps`). **Pas testé dans l'app.**
- En suspens : rien n'est commité depuis la phase 0.
- Prochaine étape : phase 2 (chargement).

## 2026-11-06 — `myapps` : conception des données revue (`feat/ia/vmou`)

- Fait : conception consolidée avec l'utilisateur et écrite dans [myapps.md](myapps.md) (§5.2 à §5.7, décisions §7, phase 1 bis en §6). Règles générales ajoutées à [CONVENTIONS.md](../CONVENTIONS.md) (règles arbitraires mises en valeur, `namespace API` dans `service/`, service qui hydrate, ce qui va dans le state). Sujet transverse « changement de langue sans redémarrage » et `isExternal` ajoutés à [later.md](later.md). **Aucun code modifié.**
- Décidé : `EntApp` hydraté par le service et stocké ; réponse `API.EntAppResponse` ; ni favoris ni module dans l'app (combinés à la lecture) ; `AppOpeningStrategy` / `getAppOpeningStrategy` au lieu de séparer apps et connecteurs ; toutes les apps stockées, `display` gardé et filtré à l'affichage ; `model/rules/`, un fichier par règle ; `favorites` partout sauf dans l'API ; `isModuleAvailableForUser`, `useUserAvailableModules` ; langue : rien pour l'instant.
- Constaté : le code actuel filtre sur `display` à la réception (`buildUserApps`), contrairement à l'ancien agrégat.
- En suspens : la phase 1 n'est toujours pas commitée.
- Prochaine étape : phase 1 bis (reprise du code de la phase 1), puis phase 2.

## 2026-11-06 — `myapps` phase 1 : structure revue (`feat/ia/vmou`)

- Demandé à la relecture : `business.ts` mélangeait règles, utilitaires et use-cases ; `MyApp` mal nommé ; le modèle contenait le type du state Redux.
- Fait : `model/business.ts` ne garde que les règles ; `use-cases.ts` (`buildUserApps`, ex-`aggregateApps`, `filterApps` + `MyAppsFilter`) ; `util.ts` (`normalizeString`, `toKebabCase`, `getAppTestID`) ; `service/adapter.ts` (`parsePreferences`) ; `reducer/` → `store/` avec `state.ts` (`MyAppsState`) ; format stocké de l'onboarding dans `storage.ts` (la règle prend la version vue) ; `MyApp` → `UserApp`. Règle générale « Structure d'un module » ajoutée à [CONVENTIONS.md](../CONVENTIONS.md).
- Vérifié : tsc sans nouvelle erreur (769), eslint propre, `yarn test` 398/398.
- En suspens : le nom `UserApp` est mon choix (la question a été interrompue) : à confirmer. (Remplacé par `EntApp` le 2026-11-06, entrée ci-dessus.)
- Prochaine étape : phase 2 (chargement).

## 2026-11-04 — `myapps` phase 1 : modèle, service, reducer, storage (`feat/ia/vmou`)

- Fait : `src/modules/myapps/` passe en `EntModule` avec `model/` (types + règles pures, 59 tests), `service/` (`/api/me/applications`, préférences), `reducer/` (Redux, `createSessionReducer`, thunks `refreshMyApps` / `toggleFavorite` / `saveFavorites`, 9 tests), `storage.ts` (déplacé, l'ancien devient façade). Supprimés : `store.ts`, l'ancien `service.ts`. Détail et écarts volontaires : §9 de [myapps.md](myapps.md).
- Hors module : `configureStore` sans `preloadedState` ; reducers de modules à typer sur toute action (règle dans [CONVENTIONS.md](../CONVENTIONS.md)) ; anciens sélecteurs `myapps` protégés contre le nouveau state (sinon `media/resource-display.ts` plantait).
- Vérifié : tsc sans nouvelle erreur (769 contre 776 avant la phase 0), eslint propre, `yarn test` 393/393. **Pas testé dans l'app.**
- Prochaine étape : phase 2 (chargement).

## 2026-11-04 — `myapps` phase 0 : droits, `entry`, `useOpenModule` (`feat/ia/vmou`)

- Fait : `isModuleAvailable` (`src/app/module/rights.ts`, 14 tests) et `useAvailableModules` ; onglets masqués par un `if` par écran d'onglet (navigation toujours statique) ; clé `entry?` sur `ModuleConfig` (écran sans params obligatoires, vérifié par le type), `tab.route` facultatif qui en hérite ; `useOpenModule` / `useCanOpenModule` (`src/app/navigation-new/open-module.ts`), nom typé sur les modules qui ont une `entry` ; `myapps` déclare `entry: 'myapps/home'`. Doc : ARCHITECTURE §2 et §3.2.
- Vérifié : tsc sans nouvelle erreur (776 avant / après, les mêmes), eslint propre sur les fichiers touchés, `yarn test` 325/325. **Pas testé dans l'app** (simulateur).
- Choix d'implémentation : sans session, `useAvailableModules` ne renvoie rien, mais les onglets ne sont pas filtrés (évite un navigateur d'onglets vide pendant la déconnexion) ; `useOpenModule` ne marche que depuis un écran des onglets.
- Prochaine étape : `myapps` phase 1.

## 2026-11-04 — Spec `myapps` validée (`feat/ia/vmou`)

- Décidé : `useOpenModule` (+ `canOpenModule`) devient l'API publique du framework pour ouvrir un module (§5.6 de [myapps.md](myapps.md)). Pas de retour forcé à `entry` pour un onglet déjà ouvert : le fonctionnel ne permet pas ce cas.
- Reporté ([later.md](later.md)) : bibliothèques, langue d'`appName`, disponibilité de `GET /api/me/applications`. En attendant : comportement actuel.
- Prochaine étape : `myapps` phase 0 (`isModuleAvailable`, `entry`, `useOpenModule`).

## 2026-11-04 — Questions `myapps` tranchées (`feat/ia/vmou`)

- Décidé : route d'entrée = clé `entry` **facultative** sur la config de module, dont `tab.route` hérite (pas l'inverse) ; favoris « après succès » partout ; libellés d'onglets (`myapps` par l'i18n, les autres par `useTabLabel`) acceptés mais à revoir ; recherche native du header plus tard.
- Reçu : la forme de `GET /api/me/applications` (intégrée en §5.3 de [myapps.md](myapps.md)) : `libraries` devient booléen, nouveau champ `appName` (libellé traduit).
- Créé : [later.md](later.md), qui reprend les sujets reportés de STATUS et ajoute les « décisions à revoir ».
- En suspens : `useOpenModule` comme API publique du framework (avis favorable, conditions en §8 Q1) ; bibliothèques, langue d'`appName`, disponibilité de l'API sur toutes les plateformes (§8 Q2).
- Prochaine étape : valider ces points, puis phase 0.

## 2026-11-04 — Conventions + spec `myapps` v2 (`feat/ia/vmou`)

- Fait : [CONVENTIONS.md](../CONVENTIONS.md) (règles pour toute la migration) ; [myapps.md](myapps.md) réécrite (v2).
- Décidé (règles générales) : bottom sheet `@gorhom/bottom-sheet` → écran `formSheet` (exemple `src/modules/auth/screens/switch-account.tsx`) ; `react-native-modal` → écran `transparentModal` ; signaler les cas où react-navigation ferait mieux ; ne pas traduire les noms de composants.
- Décidé (`myapps`) : Redux conservé ; `GET /api/me/applications` remplace `/applications-list` + `/myApps/config`, préférences à part ; apps en `sessionSetup` **bloquant**, préférences en `onSessionStart` ; plus de `buildAppLookupMap` / `AllModules()` (hooks de module) ; stockage par le framework de storage et ses hooks, clés inchangées ; `isModuleAvailable` en phase 0 ; `EntModule` + `hasRight: () => true` ; ordre d'onglet 40 ; onboarding corrigé (version, une fois par session) ; délais supprimés à l'essai.
- En suspens : forme de `GET /api/me/applications` (absente du repo) ; route d'entrée d'un module (explication + 3 propositions, recommandation : clé `entry`) ; autres questions en §8 de la fiche.
- Prochaine étape : obtenir la réponse de l'API, trancher la route d'entrée, puis phase 0.

## 2026-11-04 — Revue du suivi par l'utilisateur (`feat/ia/vmou`)

- Décidé :
  - **reportés** : notifications (ouverture, redirection), intents, modal / FormSheet « as promise ». Ils ont leur propre section dans [STATUS.md](STATUS.md) ;
  - `framework/util/media-deprecated` sera supprimé entièrement, au profit de `src/modules/media` ;
  - la série `docs-temp/auth/` est abandonnée ; la doc auth sera écrite dans `docs/` ;
  - le TODO du transport (refresh impossible → `logout`) devient une tâche indépendante ;
  - terminologie : « requirements », jamais « prérequis ».
- Corrigé : `audience` n'est **pas** migré (seule la partie issue de `auth` l'est) ; il passe dans les modules anciens.
- Ajouté : une section « Questions ouvertes » dans STATUS ; une section « Ancienneté de conception à corriger au passage » dans le gabarit et dans [myapps.md](myapps.md) (§4, dont un bug sur la version de l'onboarding). Dans `myapps`, les intents sont sortis du périmètre et ses questions passent en §8.
- Prochaine étape : trancher les questions d'architecture 2 et 3 de STATUS, et celles de [myapps.md](myapps.md) §8.

## 2026-11-04 — Mise en place du suivi + spec `myapps` (`feat/ia/vmou`)

- Fait : création de `docs/migrations/` (README avec protocole inter-sessions, STATUS, JOURNAL, gabarit) ; fiches `auth` et `media` reprises des notes des sessions d'octobre ; spécification de `myapps` (inventaire de l'ancien module, consommateurs, comportements à conserver, cible, plan en 8 phases).
- Constaté : l'app ne charge plus aucun module ancien (`AllModules()` renvoie `[]`) ; `useAppTheme` renvoie donc toujours le thème par défaut ; `src/modules/myapps/service.ts` ne compile pas ; `framework/modules/timeline/index.tsx` utilise une API `EntModule` obsolète ; la série `docs-temp/auth/` n'est pas dans ce checkout.
- Décidé : rien côté code. Organisation du suivi : voir [README.md](README.md).
- En suspens : les 6 questions ouvertes de [myapps.md](myapps.md) §7.
- Prochaine étape : trancher ces questions, puis phase 0 / 1 de `myapps`.

## 2026-10-29 — Migration `media` (reconstitué)

- Fait : module `src/modules/media` (carrousel, PDF, téléchargement, composants signés), façades `@deprecated`. Détail : [media.md](media.md).

## 2026-10-26 → 2026-10-27 — Modèle cible `auth` (reconstitué)

- Fait : champ `startup`, transport (`accountFetch`, refresh unique, annulation par session), cycle de session des modules (`sessionSetup`, `onSessionStart`, `onSessionRelease`), notifications par session, `createAuthFlows` / `useAuthFlows`. Détail : [auth.md](auth.md).

## Octobre 2026 — Migration `auth` phases 1 à 6 (reconstitué)

- Fait : stores zustand, sign-in, requirements, templates publics, façades `@deprecated`, tests Jest (stores, persistance, navigation du sign-in).
