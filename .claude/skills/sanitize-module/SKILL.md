---
name: sanitize-module
description: Assainit un module déjà basculé sur la nouvelle génération (étape 2 de la migration, après migrate-module) — un sujet par PR (hooks à la place de connect, suppression de tryAction, classes en fonctions, performance, styles, structure model/service, API publique, conversions d'UI, Temporal, droits, erreurs TS/ESLint, dette locale), ou tous les sujets avec un plan d'ensemble ; analyse, plan validé par le développeur, suivi dans la fiche du module. Pas de passage à zustand. Lancé uniquement à la main (`/sanitize-module <chemin du module> [sujet | tous]`).
argument-hint: <chemin du module> [sujet, ex. connect | tous]
disable-model-invocation: true
---

# Assainir un module

Entrée : `$ARGUMENTS` = chemin du dossier du module, puis un sujet, ou `tous` (facultatif). Sans chemin : le demander, et rien d'autre.

Sortie : un sujet d'assainissement fait, en une PR, ou tous les sujets enchaînés avec un plan d'ensemble ; la fiche du module (§9 « Assainissement ») et le suivi à jour.

**Ce skill fait gagner du temps et aide aux décisions, il n'automatise pas l'assainissement.** Le développeur choisit les sujets et décide. Claude analyse, propose, écrit ce qui a été validé, et s'arrête à chaque décision et à la fin du travail demandé.

Les règles, le suivi et l'historique de la migration sont dans le skill `migrate-module` ([INTENT.md](../migrate-module/INTENT.md) §4, [CONVENTIONS.md](../migrate-module/CONVENTIONS.md), [journal/](../migrate-module/journal/README.md)). Ce skill lit et écrit là. Exemple complet : `support`, assaini le 2026-11-19 ([journal/support.md](../migrate-module/journal/support.md) §9).

## Règles de conduite

- **Un sujet par PR**, jamais mélangé avec une bascule ([INTENT.md](../migrate-module/INTENT.md) §4). Exception : un sujet **absorbé** par un autre (il disparaît entièrement avec lui, ex. `try-action` quand `connect` supprime `mapDispatchToProps`) va dans la PR de celui-ci ; §9 le note `absorbé par <sujet>`.
- **Hors de ce skill** : le passage de Redux à zustand (on ne le fait plus, sauf l'exception `user` déjà décidée), un changement d'API serveur, React Navigation 8. Un module n'est pas déplacé vers `src/modules/` (CONVENTIONS « Portage »).
- **Questions.** Toute décision qui n'est pas déjà dans CONVENTIONS, dans la fiche du module ou dans ce skill se pose au développeur avec `AskUserQuestion` : constat en une phrase, 2 à 4 options, la recommandation en premier. Plusieurs questions indépendantes : les poser ensemble (4 au plus par appel). Les choix sans effet visible ni sur le framework peuvent être annoncés avec la recommandation, le développeur pouvant s'y opposer ; ceux qui changent le comportement ou le framework se demandent toujours. En cas de doute, demander.
- **Décisions écrites.** Une réponse va tout de suite dans la fiche (§6 « Décisions », date, raison en une ligne). Une règle générale donnée par le développeur (« toujours… », « jamais… ») : proposer de l'ajouter à CONVENTIONS.
- **Pas de code avant validation du plan.** Puis : écrire, vérifier, s'arrêter pour la relecture.
- **Le comportement ne change pas**, sauf si c'est le sujet (bug, droits) et que le développeur l'a validé. `testID` et clés de stockage inchangés.
- **Un changement du framework** (type, composant partagé) part dans sa propre PR, avant le sujet qui en a besoin. Ses effets sur d'autres modules (erreurs corrigées, comportements) se notent dans `journal/JOURNAL.md`, et un piège découvert dans `framework.md` (« Signaux connus »).
- **Framework en chantier** : chaque élément transverse est vérifié, pas supposé migré ([framework.md](../migrate-module/framework.md), colonne « Assainissement »).
- **Imiter les modèles d'assainissement** de [modules-de-reference.md](../migrate-module/modules-de-reference.md), et eux seuls (pas `communities`, ni `blog`). N'imiter que les couches que le module possède (un module sans state n'a ni `store/`, ni `session.ts`).
- **Fichiers overridés** (listés dans `override.json`, masqués à git tant que l'override est appliqué) : avant d'en modifier un, le dire au développeur et lui proposer de retirer l'override (`yarn override-restore`), de modifier et committer, puis de réappliquer son override. Sinon, ne pas toucher au fichier et lui demander comment procéder.
- Règles du dépôt toujours valables : `CLAUDE.md` (natif, dépendances, design system), `.claude/docs/CONVENTIONS.md` (git, nommage, commentaires). Pas de commit, de branche ni de push sans demande. La doc de migration n'est pas formatée par Prettier.

## Sujets

Dans l'ordre par défaut : un sujet prépare souvent le suivant (ils touchent les mêmes lignes).

| # | Sujet | Contenu | Référence |
| --- | --- | --- | --- |
| 1 | `connect` | `connect(` vers des hooks ; l'écran sous `withSession` calcule ses données avec `useMemo` (ou `useSelector` s'il reste un state). Retirer `mapDispatchToProps` enlève ses casts (`as unknown as …`) : les erreurs de type qu'ils cachaient se corrigent dans cette PR. Absorbe souvent `try-action`, le Redux sans lecteur (`dette`) et les erreurs liées aux types des props | `src/framework/modules/support/screens/create-ticket/screen.tsx`, `src/modules/myapps/hooks/` |
| 2 | `try-action` | Supprimer `tryAction`, `tryActionLegacy` et `handleAction` (`~/framework/util/redux/actions`) : l'action est appelée directement, l'appelant gère l'erreur (`try` / `catch`, toast). L'option `track` disparaît avec eux, sans appel de remplacement à `Trackers` : elle est déjà sans effet (`performAction` ne l'envoie pas), et l'ancien tracker n'est plus compatible avec la stack Firebase (décidé le 2026-11-19) | — |
| 3 | `classes` | Écrans et composants en classe vers des fonctions ; le petit écran fonction de la bascule disparaît | — |
| 4 | `structure` (service) + `transport` | `service/types.ts` (`namespace API` ; jamais `api.ts`, décidé le 2026-11-19 : c'est le fichier de types du dossier, CONVENTIONS « Types »), `service/adapter.ts`, `getModuleTransport('<module>')` pour les API sous ses scopes ; le service parle le modèle. Test de l'adapter : le JSON envoyé reste identique | CONVENTIONS « Structure d'un module », « Données et état », `support/service/` |
| 5 | `structure` (modèle + actions) | `model/index.ts` (types), `model/business.ts` (règles pures, dont les droits par fonction de l'ancien `rights.ts`), `actions.ts` (fonctions async qui reçoivent la session ; thunks seulement s'il reste un store), `store/` et `storage.ts` seulement si le module en a. Tests colocalisés | CONVENTIONS « Structure d'un module », `support/model/`, `support/actions.ts` |
| 6 | `performance` | `React.useCallback` pour les handlers et les callbacks passés aux enfants, `React.useMemo` pour les valeurs dérivées, `React.memo` pour les éléments de liste, constantes hors du composant. Pas de mesure des rendus : vérifier `react-hooks/exhaustive-deps` et jouer la recette. Piège : `BottomMenu` modifie le tableau `actions` qu'il reçoit, ne pas le mémoïser ([framework.md](../migrate-module/framework.md)) | `.claude/rules/COMPONENTS.md` §4 |
| 7 | `styles` | Styles statiques en ligne ou `StyleSheet.create` hors de `styles.ts` vers le `styles.ts` voisin, clés triées. Une valeur en dur ne devient une constante (`theme`, `constants.ts`) que si l'équivalent est **exact** ; sinon elle reste et va en §5. Un style propre à une plateforme reste conditionnel dans le JSX (`Platform.OS === 'android' && styles.x`), jamais `Platform.select` par propriété (une clé `undefined` écrase le style d'une bibliothèque). `theme.ui` n'est pas touché | `.claude/rules/DESIGN-SYSTEM.md`, CONVENTIONS « Styles » |
| 8 | `dette` | Bugs locaux, Redux sans lecteur, fichiers orphelins, façades sans importeur, composants dépréciés du framework (`PageView` → fragment ou `View`, `KeyboardPageView` → `KeyboardAvoidingView` : [framework.md](../migrate-module/framework.md)). Une correction visible se valide une par une | fiche §5 |
| 9 | `erreurs` | Corriger les erreurs `tsc` et ESLint du module : modèle et reste du code. Sans `// @ts-ignore` ni astuce de syntaxe ; un faux positif ESLint se désactive avec un commentaire qui l'explique. Une erreur qui vient du framework se corrige par un changement du framework, avant | `tsc` fichier par fichier, ESLint sur le dossier |
| 10 | `api-publique` | Ce que les autres modules utilisent : types, hooks, utilitaires, composants, exposés par des points d'entrée stables (`model/index.ts`, `hooks/`, `util.ts`, `components/`) ; importeurs rebranchés ; remontée dans le framework de ce qui est générique. Sans objet sans importeur | CONVENTIONS « Structure d'un module », [framework.md](../migrate-module/framework.md) « Candidat au framework », `src/modules/auth` (`hooks/`, `hoc/`, `components/`) |
| — | `ui` | Bottom sheet → `formSheet`, `react-native-modal` / `ModalBox` → `transparentModal`, un mode = un écran, params typés. Un composant partagé (`BottomMenu`) relève d'un chantier du framework, pas du module | CONVENTIONS « UI » |
| — | `temporal` | `moment` vers `Temporal`, même format d'affichage | `src/modules/user`, `src/modules/media` |
| — | `droits` | `rights.ts` vers `hasRight(session)` : change ce que l'utilisateur voit (sans le droit, le module devient indisponible : son entrée « Mes applis » ouvre l'app web dans le navigateur (`useOpenApp`, `src/modules/myapps/hooks/apps.ts`) au lieu de l'écran vide ; son onglet, s'il en a un, est masqué), à valider. Abandonné pour `support` | ARCHITECTURE §2 « Droits » |

`ui`, `temporal` et `droits` se placent où le module en a besoin, après `structure`. Un sujet absent de ce tableau : le décrire au développeur et lui demander s'il entre dans l'assainissement avant de continuer.

Statuts d'un sujet dans §9 : `à faire` · `en cours` · `fait` · `absorbé par <sujet>` · `sans objet` (le module n'a rien à traiter) · `abandonné` (décidé de ne pas le faire).

## Étape 1 : préparer

1. Override : lire `override.json`. Un override est actif : **le garder**. Aucun : appliquer `dev/default` (`node cli/override.js -v --no-i dev/default`) et noter que c'est le skill qui l'a appliqué.
2. Lire : [INTENT.md](../migrate-module/INTENT.md) §4, [CONVENTIONS.md](../migrate-module/CONVENTIONS.md), [journal/STATUS.md](../migrate-module/journal/STATUS.md), [journal/later.md](../migrate-module/journal/later.md), les 3 dernières entrées de [journal/JOURNAL.md](../migrate-module/journal/JOURNAL.md), la fiche `journal/<module>.md`, la ligne du module dans [journal/SUIVI.md](../migrate-module/journal/SUIVI.md), [modules-de-reference.md](../migrate-module/modules-de-reference.md). Ne pas lancer `yarn migration-status` ici : il réécrit des fichiers suivis par git ; `yarn migration-status --check` ne réécrit rien.
3. Vérifier que le module est basculé : déclaré en `EntModule` / `CoreModule`, navigation ancienne à zéro dans `journal/SUIVI.md`. Sinon : proposer `/migrate-module <chemin>` d'abord, et s'arrêter.
4. Choisir le travail :
   - un sujet donné en argument : le reprendre ;
   - `tous` : **plan d'ensemble** (ci-dessous) ;
   - rien : lister les sujets de §5 et §9 de la fiche (et ce que montre SUIVI : `connect(`…), dans l'ordre par défaut, et demander lequel, ou s'il faut tous les faire ;
   - un sujet de §9 `en cours` : **reprendre** là où il en est.
5. Mesurer la base, dans le scratchpad de la session (jamais dans le dépôt) : `tsc` fichier par fichier (commande de [BASCULE.md](../migrate-module/BASCULE.md) « Avant de commencer »), `npx eslint <dossier du module>`, `yarn test` (nombre de tests), et le total de `yarn lint-all` (la base du dépôt a déjà des erreurs : ce total se compare, il ne se juge pas).

## Étape 2 : analyser (lecture seule)

Suivre la partie « Assainissement » de [inventaire.md](../migrate-module/inventaire.md) pour le sujet, avec ses recettes de vérification. Relever les fichiers touchés, les importeurs du module concernés (agent `Explore` pour un gros module), les dépendances transverses classées selon [framework.md](../migrate-module/framework.md), et les comportements à garder (fiche §3). Vérifier dans le code ce que dit la fiche : elle a pu vieillir.

## Étape 3 : plan

### Un sujet

Dans le chat : fichiers touchés, étapes, vérification, tests Jest prévus pour la logique pure (CONVENTIONS « Structure d'un module » ; valider le plan vaut demande explicite de tests ; si le développeur les retire, ne pas en écrire), changements visibles, questions avec recommandation. Un sujet trop gros se découpe en plusieurs PR.

Passer la ligne du sujet à `en cours` dans §9 de la fiche, reporter les réponses (§6). **Attendre l'accord explicite du développeur.**

### Plan d'ensemble (`tous`)

1. Analyser tous les sujets d'abord, sans écrire de code.
2. Proposer l'ordre : celui du tableau, adapté au module ; dire quels sujets sont `absorbés`, `sans objet`, ou demandent un changement du framework avant.
3. Poser **toutes** les questions au même moment, les plus structurantes d'abord (droits, découpage des PR, changements du framework, changements visibles), par appels de 4 au plus ; annoncer les choix sans effet visible pris sur la recommandation.
4. Reporter les décisions (§6, §9), puis enchaîner les sujets **sans s'arrêter** entre eux : chaque sujet suit l'étape 4, avec un point de reprise dans §9 (statut, décisions, recette). Une décision nouvelle en cours de route : prendre l'option qui ne change rien de visible, et la signaler au rapport.
5. S'arrêter à la fin pour une relecture d'ensemble, PR par PR.

### Réécriture complète

Seulement si le développeur la décide (module à reprendre presque entièrement, comme `myapps`). La fiche longue se crée depuis [journal/\_template.md](../migrate-module/journal/_template.md), avec des phases ; chaque phase est une PR. Dans une fiche longue, « Décisions » est §7 et « Avancement » §9 :

| # | Phase | Contenu | Vérification |
| --- | --- | --- | --- |
| 0 | Préalables du framework | Évolutions du framework décidées (clé de config, hook, composant remonté), doc ARCHITECTURE | tsc, eslint, tests de la logique pure |
| 1 | Données | `model/`, `service/`, `store/`, `storage.ts` (clés inchangées), `actions.ts`, tests Jest | tsc, eslint, `yarn test` |
| 2 | Chargement | `session.ts` (hooks de session créés par une fonction qui reçoit ses dépendances) | tsc ; connexion : state rempli |
| 3 | API publique + façades | Hooks / composants publics, façades `@deprecated`, importeurs migrés | tsc, aucun import cassé |
| 4 | Écrans | Hooks, fonctions, options d'écran | parcours dans l'app |
| 5 | Modales | `formSheet` / `transparentModal`, `useConfirmRemove` | parcours dans l'app |
| 6 | Nettoyage | Ancien code, façades sans importeur, orphelins (demander s'il faut garder quelque chose) | `grep -rn` des anciens chemins |

## Étape 4 : exécuter un sujet

1. Annoncer les fichiers touchés (signaler un fichier overridé). Une question nouvelle en cours de route : s'arrêter, la poser, noter la décision (en plan d'ensemble : voir plus haut).
2. Écrire le code en imitant le modèle d'assainissement pertinent. `ToDo(<module>-migration): …` pour ce qui est volontairement reporté.
3. Vérifier, et comparer à la base **du sujet** : l'état après le sujet précédent, remesuré, pas la mesure de l'étape 1 :
   - `npx eslint --fix` sur les fichiers touchés, puis `npx eslint <dossier du module>` ;
   - `tsc` fichier par fichier : aucune erreur nouvelle (et, pour le sujet `erreurs`, celles du module en moins) ;
   - `yarn test` ;
   - `yarn migration-status --check` ;
   - `testID` et clés de stockage inchangés (recettes d'[inventaire.md](../migrate-module/inventaire.md)).
     Ne jamais dire « ça passe » sans l'avoir lancé. Ce qui n'a pas pu être lancé est dit.
4. Test dans l'app : écrire dans §9 la recette du sujet (comportements de la fiche §3 concernés), donner les commandes des flows Maestro du module, et **demander** si le développeur veut lancer un build (skills `build-app` / `simulator`). Jamais de build de sa propre initiative. Sans test, écrire « pas testé dans l'app ».
5. Suivi du sujet : fiche §9 (statut, décisions, PR, recette) et §5 (sujet retiré du backlog, ou déplacé dans « Noté, non traité »). Un bug ou un défaut de conception vu en chemin et non corrigé se relève : fiche §5 s'il est propre au module, sinon [later.md](../migrate-module/journal/later.md) (« Bugs et défauts de conception relevés ») ([INTENT.md](../migrate-module/INTENT.md) §4).
6. **S'arrêter pour la relecture** (un sujet seul ; en plan d'ensemble, à la fin). Dire ce qu'il faut relire en priorité (choix faits sans validation, écarts avec le modèle, points fragiles, changements visibles). Proposer `/code-review` si le sujet est gros. Appliquer les retours, les noter (fiche ou CONVENTIONS).

## Fin de la session

- Sujets à jour dans §9 de la fiche ; ligne de `journal/STATUS.md` ; **une** entrée en tête de `journal/JOURNAL.md` pour la session (complétée s'il y a eu plusieurs sujets) ; `yarn migration-status` pour régénérer `journal/SUIVI.md` ; total de `yarn lint-all` comparé à la base.
- Override : si c'est le skill qui a appliqué `dev/default`, proposer `yarn override-restore`. Vérifier que `git status` ne montre pas de fichiers d'override.
- Proposer les quinze minutes d'[INTENT.md](../migrate-module/INTENT.md) §8 ; ce qui en sort va dans CONVENTIONS ou dans ce skill, avec l'accord du développeur.
- Proposer le sujet suivant de la fiche, sans le démarrer.
- Session interrompue : faire quand même le suivi, pour qu'une prochaine session reprenne avec `/sanitize-module <chemin> <sujet>`.
