---
name: migrate-module
description: Migre un module de l'ancienne génération (NavigableModule, navigation dynamique, module-config.ts) vers la nouvelle (EntModule / CoreModule, navigation statique, hooks de session) — analyse, fiche et plan par phases dans docs/migrations/, puis exécution phase par phase avec validation du développeur. Lancé uniquement à la main (`/migrate-module <chemin du module>`).
argument-hint: <chemin du module, ex. src/framework/modules/news>
disable-model-invocation: true
---

# Migrer un module

Entrée : `$ARGUMENTS` (chemin du dossier du module). S'il manque, le demander, et rien d'autre.

Sortie : la fiche `docs/migrations/<module>.md` (analyse + plan par phases), puis l'exécution des phases, une à la fois.

**Ce skill fait gagner du temps et aide aux décisions, il n'automatise pas la migration.** Le développeur décide. Claude analyse, propose, écrit ce qui a été validé, et s'arrête à chaque décision et à chaque fin de phase.

## Règles de conduite

- **Questions.** Toute décision qui n'est pas déjà dans `docs/migrations/CONVENTIONS.md`, dans la section « Décisions » d'une fiche ou dans ce skill se pose au développeur avec `AskUserQuestion` : constat en une phrase, 2 à 4 options, la recommandation en premier. Plusieurs questions indépendantes : les poser ensemble (4 au plus par appel). En cas de doute, demander.
- **Décisions écrites.** Une réponse va tout de suite dans §7 « Décisions » de la fiche (date, raison en une ligne). Une question laissée en suspens va dans §8. Une règle générale donnée par le développeur (« toujours… », « jamais… ») : proposer de l'ajouter à `docs/migrations/CONVENTIONS.md`.
- **Pas de code avant validation du plan.** Puis une phase à la fois : annoncer, écrire, vérifier, s'arrêter pour la relecture.
- **Porter tel quel** (CONVENTIONS « Portage ») : corriger au passage seulement ce que liste §4 de la fiche, validé.
- **Framework en chantier** : chaque élément transverse dont dépend le module est vérifié, pas supposé migré. Voir [framework.md](framework.md).
- **Imiter les modules de référence** listés dans [modules-de-reference.md](modules-de-reference.md), et eux seuls (pas `communities`, ni `blog`).
- **Fichiers overridés** (listés dans `override.json`, masqués à git tant que l'override est appliqué) : avant d'en modifier un, le dire au développeur et lui proposer de retirer l'override (`yarn override-restore`), puis de modifier et committer, puis de réappliquer son override. Sinon, ne pas toucher au fichier et lui demander comment procéder.
- Règles du dépôt toujours valables : `CLAUDE.md` (natif, dépendances, design system), `.claude/docs/CONVENTIONS.md` (git, nommage, commentaires). Pas de commit, de branche ni de push sans demande.

## Étape 1 : préparer

1. Override : lire `override.json`.
   - Un override est actif (`dev/default` ou un autre, choisi par le développeur) : **le garder**. Noter son nom et la liste des fichiers overridés.
   - Aucun override : appliquer `dev/default` (`node cli/override.js -v --no-i dev/default`), et noter que c'est le skill qui l'a appliqué.
2. Lire, dans l'ordre (protocole de `docs/migrations/README.md`) : `STATUS.md`, `later.md`, les 3 dernières entrées de `JOURNAL.md`, `CONVENTIONS.md`, `docs/ARCHITECTURE.md` §2, §3 et §6, puis [modules-de-reference.md](modules-de-reference.md).
3. Identifier le module : `<module>` = nom du dossier.
   - Si `docs/migrations/<module>.md` existe et que son statut n'est pas `à faire` : **reprendre**. Lire la fiche, vérifier que §9 « Avancement » correspond au code (`grep -rn "ToDo(<module>-migration)" src`), dire où on en est et proposer la suite. Ne pas refaire l'analyse.
   - Si le chemin est un dossier de sous-modules (`connectors/`, `viescolaire/`, `widgets/`) : demander lequel migrer, ou s'ils sont traités ensemble.
   - Si `later.md` ou STATUS dit qu'un préalable bloque ce module (ex. notifications avant `timeline`) : le signaler et demander s'il faut continuer.
4. Mesurer la base de vérification, pour comparer ensuite : `yarn ts-all 2>&1 | grep -c "error TS"`, `yarn lint-all` (erreurs existantes), `yarn test` (nombre de tests). Noter les chiffres.

## Étape 2 : analyser (lecture seule)

Suivre [inventaire.md](inventaire.md) : fichiers du module, consommateurs externes, comportements à conserver, dépendances transverses, conversions d'UI. Pour un gros module, déléguer le relevé des consommateurs à un agent `Explore` et garder la lecture du module pour soi.

Classer chaque dépendance transverse selon [framework.md](framework.md).

## Étape 3 : écrire la fiche et le plan

Créer `docs/migrations/<module>.md` depuis `docs/migrations/_template.md`, statut `spec`. Français, phrases courtes, dates absolues, noms de code non traduits, « requirements » jamais « prérequis ».

- §1 à §4 : résultat de l'analyse. §4 liste les conversions d'UI imposées et les cas où react-navigation ferait mieux (statut `à valider`).
- §5 « Cible » : emplacement, type de module, config (`name`, `scope`, points d'entrée `entries` — voir [framework.md](framework.md) —, droits, `redux`, `storages`, `fileManager`, hooks de session), structure (CONVENTIONS « Structure d'un module »), API publique, façades.
- §6 « Plan par phases » : partir des phases types ci-dessous, retirer celles qui ne servent pas, découper une phase trop grosse. Chaque phase dit son contenu et sa vérification.
- §8 « Questions ouvertes » : toutes les décisions à prendre, avec options et recommandation. Les dépendances transverses incertaines en font partie.
- Ce qui n'est pas dans le périmètre (demande du développeur, écrans d'un autre module) est dit en §1, avec ce qui le remplace (ex. un lien `entries.userMenu` déclaré par le module qui reprend l'écran).

### Emplacement

L'emplacement est **toujours une question** de §8, posée au développeur à chaque migration, avec une recommandation tirée de l'analyse :

- `src/framework/modules/<module>/` (sur place) : la règle par défaut d'ARCHITECTURE §2 (d'autres équipes y travaillent, les diffs git restent lisibles) ;
- `src/modules/<module>/` : pour un module **quasiment réécrit** (souvent un `CoreModule` technique, comme `auth` ou `media`), avec des façades `@deprecated` aux anciens chemins ;
- si `src/modules/<module>/` **existe déjà** (migration commencée) : le dire dans la question. Deux dossiers ne peuvent pas déclarer le même module : il faut choisir l'un des deux.

Dans tous les cas :

- Garder les chemins existants autant que possible : un fichier dont le rôle ne change pas reste où il est (écrans, composants, styles).
- Un fichier qui doit bouger se déplace **avec `git mv`, sans changer son contenu, dans une phase à part** (phase « Déplacements ») : proposer au développeur de la committer avant la suite, pour que git suive le renommage.

### Phases types

| #     | Phase                    | Contenu                                                                                                                                                                                                                                                                                                                      | Vérification                                     |
| ----- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 0     | Préalables du framework  | Évolutions du framework décidées en §8 (nouvelle clé de config, hook, composant remonté dans le framework…). Doc ARCHITECTURE mise à jour.                                                                                                                                                                                   | tsc, eslint, tests de la logique pure            |
| 0 bis | Préalables : modules     | Seulement si le développeur a choisi, pour une dépendance, de migrer d'abord un autre module (catégorie « Ancien, à migrer », option A de [framework.md](framework.md) ; voir « Modules préalables » ci-dessous). Chacun sa fiche (`/migrate-module`). Dire ce que chacun bloque : souvent une partie d'une phase seulement. | selon leurs fiches                               |
| 1     | Déplacements             | `git mv` seuls (si nécessaires).                                                                                                                                                                                                                                                                                             | tsc inchangé                                     |
| 2     | Données                  | `model/` (types + règles), `service/` (`namespace API`, `adapter.ts`, `getModuleTransport`), `store/`, `storage.ts` (clés et namespaces inchangés), `actions.ts`. Tests Jest de la logique pure.                                                                                                                             | tsc, eslint, `yarn test`                         |
| 3     | Déclaration + chargement | `index.ts` en `EntModule` / `CoreModule`, ajout dans `src/app/config/modules.ts`, droits, `scope`, `entries` (`myApps`, `tab`, `userMenu`), `sessionSetup` / `onSessionStart` (plus de `callAtLogin`).                                                                                                                       | tsc ; connexion : state rempli (test dans l'app) |
| 4     | API publique + façades   | Hooks / composants publics, façades `@deprecated` aux chemins importés de l'extérieur, consommateurs migrés.                                                                                                                                                                                                                 | tsc, aucun import cassé                          |
| 5     | Écrans                   | `defineScreen`, portés tels quels ; header par options (`headerLeftActions` / `headerRightActions`) ; `testID` conservés.                                                                                                                                                                                                    | parcours dans l'app                              |
| 6     | Modales                  | `defineModal` ; bottom sheet → `formSheet`, `react-native-modal` → `transparentModal` ; `useConfirmRemove`.                                                                                                                                                                                                                  | parcours dans l'app                              |
| 7     | Points reportés          | Notifications, intents, widgets, navigation vers un module pas encore migré… selon l'état du framework : souvent reportés (`later.md` + `ToDo(<module>-migration)`).                                                                                                                                                         | selon décision                                   |
| 8     | Nettoyage                | Suppression de `module-config.ts`, `navigation/`, de l'ancien Redux, des façades sans importeur, des fichiers orphelins et du code hors périmètre non repris (il reste dans git ; décidé pour `user`). Demander si ce code doit plutôt être gardé.                                                                           | `grep -rn` des anciens chemins                   |

### Modules préalables

Migrer d'abord un autre module ancien est **toujours une question** (catégorie « Ancien, à migrer » de [framework.md](framework.md)), jamais une phase ajoutée d'office.

- Si le développeur choisit de le migrer d'abord et que ce module est **gros** (plusieurs écrans, un store, des consommateurs) : proposer d'**arrêter ici** la migration en cours, de migrer le préalable avec son propre `/migrate-module`, puis de reprendre (la fiche garde l'état : statut, §7, §8, §9 ; le préalable va dans §9 et dans `STATUS.md`).
- S'il est petit : proposer la phase 0 bis dans le plan, ou l'arrêt, au choix du développeur.

Tests Jest : la logique pure a son test (CONVENTIONS « Structure d'un module »). Le plan les prévoit ; valider le plan vaut demande explicite de tests. Si le développeur les retire du plan, ne pas en écrire.

### Validation du plan

Résumer la fiche en quelques lignes dans le chat (cible, phases, nombre de questions), puis poser les questions de §8 avec `AskUserQuestion`, les plus structurantes d'abord (emplacement, évolutions du framework, gestion d'état).

Une réponse qui ouvre une **évolution du framework** (nouvelle clé de config, regroupement de clés…) appelle ses propres questions de forme avant la validation : typage, valeurs par défaut et héritages, clés prévues mais sans consommateur, une valeur ou une liste. Mesurer d'abord son impact (`grep` des usages des clés touchées) et le décrire en §5 (fichiers touchés, phase 0). Exemple : `entries`, décidé pendant le plan de `user` ([user.md](../../../docs/migrations/user.md) §5.3).

Reporter les réponses (§7), mettre la fiche au statut `en cours`, ajouter la ligne du module à jour dans `STATUS.md`. **Attendre l'accord explicite du développeur sur le plan** avant la première phase.

## Étape 4 : exécuter une phase

1. Annoncer la phase (contenu, fichiers touchés). Si l'un d'eux est overridé, le signaler et proposer de retirer l'override d'abord (voir « Règles de conduite »). Si une question nouvelle apparaît en cours de route : s'arrêter, la poser, noter la décision.
2. Écrire le code en imitant le module de référence pertinent. Laisser `ToDo(<module>-migration): …` pour ce qui est volontairement reporté.
3. Vérifier, et comparer à la base de l'étape 1 :
   - `npx eslint --fix` sur les fichiers touchés, puis `yarn lint-all` ;
   - `yarn ts-all` : aucune erreur nouvelle (comparer le nombre ; lister les nouvelles s'il y en a) ;
   - `yarn test` si de la logique pure a changé.
     Ne jamais dire « ça passe » sans l'avoir lancé. Ce qui n'a pas pu être lancé est dit.
4. Test dans l'app (phases 3, 5, 6 surtout) : décrire le scénario (profil, écrans, actions, résultat attendu) et **demander** si le développeur veut lancer un build (skills `build-app` / `simulator`). Jamais de build de sa propre initiative. Sans test, écrire « pas testé dans l'app ».
5. Écrire le suivi : §9 « Avancement » de la fiche, ligne de `STATUS.md`, entrée en tête de `JOURNAL.md` (format du fichier : fait, décidé, vérifié, en suspens, prochaine étape).
6. **S'arrêter pour la relecture.** Dire ce qu'il faut relire en priorité (choix faits sans validation, écarts avec le module de référence, points fragiles). Proposer `/code-review` si la phase est grosse. Appliquer les retours, les noter (§7 ou CONVENTIONS), puis demander s'il faut passer à la phase suivante.

## Fin de la migration

- Statut de la fiche : `fait` (legacy encore présent) ou `nettoyé`. STATUS et JOURNAL à jour.
- Override : si c'est le skill qui a appliqué `dev/default`, proposer `yarn override-restore` ; un override mis par le développeur reste en place. Vérifier que `git status` ne montre pas de fichiers d'override (`override.json`, `phrase.json`, `src/platforms/*`).
- Rappeler au développeur qu'après sa relecture complète, il peut ajouter le module à [modules-de-reference.md](modules-de-reference.md) (procédure dans ce fichier). Ne jamais l'y ajouter sans sa demande.
- Session interrompue : faire quand même l'étape 4.5 (suivi), pour qu'une prochaine session reprenne avec `/migrate-module <chemin>`.
