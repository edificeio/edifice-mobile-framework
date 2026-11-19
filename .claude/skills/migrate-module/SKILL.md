---
name: migrate-module
description: Bascule un module de l'ancienne génération (NavigableModule, module-config.ts, navigation dynamique) vers la nouvelle (EntModule / CoreModule, navigation statique, hooks de session) sans changer son comportement ni son code interne — étape 1 de la migration (INTENT.md), patron BASCULE.md, fiche et suivi dans journal/. L'assainissement qui suit (étape 2) est le skill sanitize-module. Lancé uniquement à la main (`/migrate-module <chemin du module>`).
argument-hint: <chemin du module, ex. src/framework/modules/news>
disable-model-invocation: true
---

# Basculer un module

Entrée : `$ARGUMENTS` (chemin du dossier du module). S'il manque, le demander, et rien d'autre.

Sortie : le module sur la nouvelle génération, en un changement relisible ; sa fiche `journal/<module>.md` ; le suivi à jour.

**Ce skill fait la bascule, et seulement elle** ([INTENT.md](INTENT.md) §4). Les gestes sont mécaniques ([BASCULE.md](BASCULE.md)) : Claude les applique, le développeur tranche les rares décisions, relit et joue le parcours. Tout le reste va dans le backlog de la fiche (§5), pour `/sanitize-module`.

Ce dossier est aussi l'historique de toute la migration : règles ([INTENT.md](INTENT.md), [BASCULE.md](BASCULE.md), [CONVENTIONS.md](CONVENTIONS.md)), état des dépendances ([framework.md](framework.md)), suivi ([journal/](journal/README.md)). `sanitize-module` lit et écrit ici.

## Règles de conduite

- **Questions.** Seulement pour : le suffixe de la route d'accueil (toujours), une condition d'arrêt de [BASCULE.md](BASCULE.md), un cas que les gestes ne couvrent pas. Ce que CONVENTIONS, BASCULE ou la fiche décident déjà ne se repose pas. Avec `AskUserQuestion` : constat en une phrase, 2 à 4 options, la recommandation en premier ; plusieurs questions indépendantes ensemble (4 au plus par appel).
- **Décisions écrites.** Une réponse va tout de suite dans §6 de la fiche (date, raison en une ligne). Une règle générale donnée par le développeur (« toujours… », « jamais… ») : proposer de l'ajouter à CONVENTIONS ou à BASCULE.
- **Porter tel quel.** Rien hors des gestes. Chaque envie (hooks, structure, conversions d'UI, bug, dette) devient une ligne de §5. Jamais de passage de Redux à zustand.
- **Pas de code avant l'accord** du développeur sur la fiche (étape 3).
- **Framework en chantier** : chaque élément transverse dont dépend le module est vérifié dans le code, pas supposé migré ([framework.md](framework.md)).
- **Imiter** les modèles de bascule de [modules-de-reference.md](modules-de-reference.md), et eux seuls.
- **Fichiers overridés** (listés dans `override.json`, masqués à git tant que l'override est appliqué) : avant d'en modifier un, le dire au développeur et lui proposer de retirer l'override (`yarn override-restore`), de modifier et committer, puis de réappliquer son override. Sinon, ne pas toucher au fichier et lui demander comment procéder.
- Règles du dépôt toujours valables : `CLAUDE.md` (natif, dépendances, design system), `.claude/docs/CONVENTIONS.md` (git, nommage, commentaires). Pas de commit, de branche ni de push sans demande.

## Étape 1 : préparer

1. Override : lire `override.json`.
   - Un override est actif (`dev/default` ou un autre, choisi par le développeur) : **le garder**. Noter son nom et la liste des fichiers overridés.
   - Aucun override : appliquer `dev/default` (`node cli/override.js -v --no-i dev/default`), et noter que c'est le skill qui l'a appliqué.
2. Lire dans l'ordre (sans lancer `yarn migration-status`, qui réécrit des fichiers suivis par git ; il se lance à l'étape 4.5) : [INTENT.md](INTENT.md), [BASCULE.md](BASCULE.md), [CONVENTIONS.md](CONVENTIONS.md), [journal/STATUS.md](journal/STATUS.md), [journal/later.md](journal/later.md), les 3 dernières entrées de [journal/JOURNAL.md](journal/JOURNAL.md), la ligne du module dans [journal/SUIVI.md](journal/SUIVI.md), puis [modules-de-reference.md](modules-de-reference.md).
3. Identifier le module : `<module>` = nom du dossier.
   - Le module est déjà en `EntModule` / `CoreModule` (statut SUIVI autre que `à faire`) : ce n'est pas une bascule. Si sa navigation ancienne n'est pas à zéro, finir la bascule ; sinon proposer `/sanitize-module`.
   - `journal/<module>.md` existe et son statut n'est pas `à faire` : **reprendre**. Vérifier que la fiche correspond au code (`grep -rn "ToDo(<module>-migration)" src`), dire où on en est et proposer la suite.
   - Dossier de sous-modules (`connectors/`, `viescolaire/`, `widgets/`) : demander lequel basculer, ou s'ils sont basculés ensemble.
   - `later.md` ou STATUS dit qu'un préalable bloque ce module (ex. notifications avant `timeline`) : le signaler et demander s'il faut continuer.
   - Emplacement : sur place. Si `src/modules/<module>/` existe déjà, on continue là (CONVENTIONS « Portage ») ; deux dossiers ne peuvent pas déclarer le même module.
4. Mesurer la base, pour comparer ensuite, dans le scratchpad de la session (jamais dans le dépôt) : `tsc` fichier par fichier (commande de BASCULE « Avant de commencer »), `npx eslint <dossier du module>`, `yarn test` (nombre de tests), total de `yarn lint-all` (la base du dépôt a déjà des erreurs : ce total se compare, il ne se juge pas).

## Étape 2 : relever (lecture seule)

Suivre la partie « Bascule » de [inventaire.md](inventaire.md) : les fichiers du module geste par geste, ses importeurs, ses comportements, les conditions d'arrêt. Pour un gros module, déléguer le relevé des importeurs à un agent `Explore` et garder la lecture du module pour soi.

Classer chaque dépendance transverse selon [framework.md](framework.md) : pour la bascule, la seule question est « marche-t-elle dans la nouvelle navigation ? ».

## Étape 3 : écrire la fiche, faire valider

Créer `journal/<module>.md` depuis [journal/\_template-bascule.md](journal/_template-bascule.md), statut `à faire`. Français, phrases courtes, dates absolues, noms de code non traduits, « requirements » jamais « prérequis ».

- §1 à §3 : résultat du relevé. §3 : les comportements à conserver, avec un flow Maestro proposé pour chacun quand c'est possible (recommandé, pas bloquant), sinon la recette manuelle.
- §4 : les gestes qui s'appliquent, avec les routes anciennes → nouvelles et les façades à laisser.
- §5 : tout ce qui est vu et pas touché (backlog de `/sanitize-module`), **dont chaque bug et chaque défaut de conception rencontrés** ([INTENT.md](INTENT.md) §4 « En profiter pour relever »). Ce qui dépasse le module va dans [journal/later.md](journal/later.md) (« Bugs et défauts de conception relevés »).
- §6 « Questions ouvertes » : les conditions d'arrêt rencontrées, le suffixe de la route d'accueil, les cas non couverts.

Résumer la fiche en quelques lignes dans le chat (gestes, routes, façades, conditions d'arrêt, taille du backlog), puis poser les questions avec `AskUserQuestion`. Proposer aussi d'écrire les flows Maestro avant la bascule ([.maestro/README.md](../../../.maestro/README.md), section « Écrire les flows d'un module à migrer »). Reporter les réponses (§6), ajouter ou mettre à jour la ligne du module dans `journal/STATUS.md`. **Attendre l'accord explicite du développeur** avant d'écrire du code.

## Étape 4 : basculer

Une bascule est petite : un seul passage, sauf si le développeur demande de la découper.

1. Annoncer les fichiers touchés. Si l'un d'eux est overridé, le signaler et proposer de retirer l'override d'abord. Si une question nouvelle apparaît en cours de route : s'arrêter, la poser, noter la décision.
2. Appliquer les gestes de [BASCULE.md](BASCULE.md), en imitant le modèle de bascule. Laisser `ToDo(<module>-migration): …` sur chaque import du code d'un module ancien et sur ce qui est volontairement reporté.
3. Vérifier, et comparer à la base de l'étape 1 :
   - `npx eslint --fix` sur les fichiers touchés, puis `npx eslint <dossier du module>` ; total de `yarn lint-all` comparé à la base ;
   - `tsc` fichier par fichier : aucune erreur nouvelle (lister les nouvelles s'il y en a) ;
   - `yarn test` si un test couvre le module ;
   - `yarn migration-status --check`, puis à l'étape 5 `yarn migration-status` : navigation ancienne à zéro pour le module, chaque module ancien encore importé justifié dans la fiche ;
   - `testID` et clés de stockage inchangés (`git diff` sur `testID`, clés de storage).
     Ne jamais dire « ça passe » sans l'avoir lancé. Ce qui n'a pas pu être lancé est dit.
4. Test dans l'app : décrire le scénario (comportements de §3 : profil, écrans, actions, résultat attendu), donner les commandes Maestro des flows du module s'il en a, et **demander** si le développeur veut lancer un build (skills `build-app` / `simulator`). Jamais de build de sa propre initiative. Sans test, écrire « pas testé dans l'app ».
5. Écrire le suivi : fiche (statut, §4, §7, §8), ligne de `journal/STATUS.md`, **une** entrée en tête de `journal/JOURNAL.md` pour la session (fait, décidé, vérifié, en suspens, prochaine étape), `journal/SUIVI.md` régénéré (`yarn migration-status`).
6. **S'arrêter pour la relecture.** Dire ce qu'il faut relire en priorité : gestes non mécaniques (écrans en classe, `setOptions` gardés, hooks de session, `withSession` autour d'un `connect(`), routes renommées et télémétrie, façades, `ToDo`. Proposer `/code-review` si le diff est gros. Appliquer les retours, les noter (fiche §6, ou CONVENTIONS / BASCULE pour une règle générale).

Commit : un seul pour la bascule du module, fiche et suivi compris, jamais avec un sujet d'assainissement ; seulement sur demande.

## Fin de la bascule

- Statut de la fiche : `basculé`, puis `joué dans l'app` quand le parcours l'a été. STATUS, JOURNAL et SUIVI à jour.
- Override : si c'est le skill qui a appliqué `dev/default`, proposer `yarn override-restore` ; un override mis par le développeur reste en place. Vérifier que `git status` ne montre pas de fichiers d'override (`override.json`, `phrase.json`, `src/platforms/*`).
- Rappeler que §5 de la fiche est le backlog de `/sanitize-module <chemin>`.
- Proposer les quinze minutes d'[INTENT.md](INTENT.md) §8 : questions reposées, ce qui a cassé malgré `tsc`, corrections à la main du développeur, temps passé. Ce qui en sort va dans BASCULE, CONVENTIONS ou ce skill, avec l'accord du développeur.
- Après sa relecture complète, le développeur peut ajouter le module à [modules-de-reference.md](modules-de-reference.md). Ne jamais l'y ajouter sans sa demande.
- Session interrompue : faire quand même l'étape 4.5 (suivi), pour qu'une prochaine session reprenne avec `/migrate-module <chemin>`.

## Le suivi calculé

[journal/SUIVI.md](journal/SUIVI.md) et `journal/suivi.json` sont générés par `cli/migration-status.js`, qui lit `src/` sans rien y modifier. Ils ne se modifient pas à la main.

```bash
yarn migration-status           # recalcule journal/SUIVI.md et journal/suivi.json (fichiers suivis par git : en fin de session seulement)
yarn migration-status --check   # n'écrit rien ; échoue si un compteur de l'ancienne génération a augmenté
```

Pour chaque module :

| Colonne | Ce qui est compté | Sert à |
| --- | --- | --- |
| Statut | `à faire` (`NavigableModule`), `non chargé` (absent de `src/app/config/modules.ts`), `bascule incomplète`, `basculé, sans test`, `basculé, testable` (au moins un flow Maestro) | savoir où en est le module sans ouvrir son code |
| Fichiers, Lignes | les fichiers source, tests (`*.test.*`) non compris | estimer la taille |
| Écrans anciens / nouveaux | les `<Stack.Screen>` / les fichiers avec `defineScreen(` ou `defineModal(` | estimer la taille de la bascule |
| Navigation ancienne | les fichiers avec `createModuleNavigator`, un import de `~/app/navigation` ou de `~/framework/navigation`, `NativeStackScreenProps`, ou un `navigation.setOptions` au contenu ancien (`headerRight:`, `headerLeft:`, `navBarOptions`) | vérifier qu'une bascule est complète |
| `connect(` | les fichiers qui l'utilisent | préparer l'assainissement |
| Modules anciens importés | les modules encore en `NavigableModule` importés par ce module | choisir l'ordre de migration ; chaque import se justifie dans la fiche |
| Notif. | la présence d'un `notif-handler` | repérer les modules bloqués par la question des notifications |
| Flows | les fichiers `.maestro/flows/<module>-*.yaml` | savoir si le module a un test dans l'app |

Un module est en `bascule incomplète` s'il garde de la navigation ancienne, ou s'il importe les routes (`navigation/`) d'un module ancien. Les autres imports d'un module ancien restent dans leur colonne : la fiche dit pour chacun pourquoi il est permis.

En tête de page, les totaux qui doivent baisser : modules restants, lignes dans les modules anciens, écrans anciens, fichiers sur l'ancienne navigation, fichiers avec `connect(`. `--check` compare ces totaux à `journal/suivi.json`.
