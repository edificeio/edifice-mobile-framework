# Migration : journal

Suivi de la migration de l'ancienne génération de code (modules `NavigableModule`, navigation dynamique) vers la nouvelle (`CoreModule` / `EntModule`, navigation statique). Le contexte technique est dans [ARCHITECTURE.md](../../../docs/ARCHITECTURE.md).

**À lire en premier : [INTENT.md](../INTENT.md)** (pourquoi on migre, ce qui est dans la migration, comment on la mène, quand elle est finie).

Ce dossier sert de **mémoire partagée entre les sessions** (humaines ou Claude) : une session qui reprend le sujet doit pouvoir savoir où on en est sans relire l'historique git. Il était dans `docs/migrations/` jusqu'au 2026-11-19 ; il vit dans le skill `migrate-module`, et `sanitize-module` y écrit aussi.

## Fichiers

Règles, à la racine du skill :

| Fichier | Contenu |
| --- | --- |
| [INTENT.md](../INTENT.md) | Intention de la migration : contexte, deux étapes et deux skills, règles de conduite, définition de « terminé » |
| [BASCULE.md](../BASCULE.md) | Patron de la bascule d'un module (étape 1) : gestes, conditions d'arrêt, vérification |
| [CONVENTIONS.md](../CONVENTIONS.md) | Règles valables pour toute la migration (portage, emplacement, UI, nommage, structure, données) |
| [framework.md](../framework.md), [inventaire.md](../inventaire.md), [modules-de-reference.md](../modules-de-reference.md) | État des dépendances transverses, relevé d'un module, modules à imiter |

Suivi, dans ce dossier :

| Fichier | Contenu |
| --- | --- |
| [SUIVI.md](SUIVI.md) | Suivi **calculé** par `yarn migration-status` : compteurs par module (ne pas modifier à la main) |
| [STATUS.md](STATUS.md) | Tableau de bord : état de chaque module et chantier, prochaines étapes |
| [JOURNAL.md](JOURNAL.md) | Journal daté des sessions (ajout en tête, jamais réécrit) |
| [later.md](later.md) | Plus tard : sujets reportés et décisions à revoir |
| [\_template-bascule.md](_template-bascule.md) | Gabarit de la fiche d'un module : bascule, puis assainissement (§9) |
| [\_template.md](_template.md) | Gabarit long, pour une réécriture complète décidée en assainissement |
| [auth.md](auth.md) | Fiche du module `auth` (fait, reste à faire, décisions, assainissement) |
| [media.md](media.md) | Fiche du module `media` |
| [myapps.md](myapps.md) | Fiche de `myapps` (réécrit dans `src/modules/myapps`) |
| [user.md](user.md) | Fiche de `user` : plan validé en attente, `entries` (points d'entrée des modules) |
| [timeline.md](timeline.md) | Fiche de `timeline` (pas encore spécifiée) : découpage avec `notifications` |
| [wiki.md](wiki.md) | Fiche de `wiki` : spécifiée, en attente des préalables `explorer` et `audience` |
| [explorer.md](explorer.md) | Fiche d'`explorer` : `CoreModule` sur place, préalable de `wiki` |
| [support.md](support.md) | Fiche de `support` : premier module passé par la bascule seule |

## Protocole d'une session

- Basculer un module : `/migrate-module <chemin du module>` (étape 1).
- Assainir un module basculé : `/sanitize-module <chemin du module> [sujet]` (étape 2, un sujet par PR).

Les deux skills, lancés à la main, suivent ce protocole et reprennent où on en était si la fiche existe déjà.

**En début de session**

1. Lire [STATUS.md](STATUS.md) et [later.md](later.md) (ce qu'il ne faut pas démarrer), puis les 2-3 dernières entrées de [JOURNAL.md](JOURNAL.md).
2. Lire [CONVENTIONS.md](../CONVENTIONS.md), puis la fiche du module concerné. Ses « Décisions » sont acquises : ne pas les rediscuter sans raison nouvelle. Ses « Questions ouvertes » se tranchent **avec l'utilisateur**, pas en autonomie.
3. Vérifier que les fichiers et symboles cités existent toujours (les fiches peuvent avoir vieilli).

**Pendant**

- Bascule : un passage, puis relecture. Assainissement : un sujet, plan validé, puis écriture ; ou tous les sujets avec un plan d'ensemble (questions d'abord, puis enchaînement). Chaque fois, un état qui compile et qu'on peut tester.
- Noter une décision dans la fiche dès qu'elle est prise (avec la raison en une ligne).

**En fin de session** (même interrompue)

1. Ajouter **une** entrée en tête de [JOURNAL.md](JOURNAL.md) pour la session, même si elle a traité plusieurs sujets : fait, décidé, vérifié, en suspens, prochaine étape.
2. Mettre à jour la ligne du module dans [STATUS.md](STATUS.md) et sa fiche (statut, §7 pour la bascule, §9 pour l'assainissement).
3. Relancer `yarn migration-status` et commiter [SUIVI.md](SUIVI.md) avec le reste.
4. Laisser des marqueurs `ToDo(<module>-migration): …` dans le code pour ce qui est volontairement reporté : `grep -rn "migration)" src` les retrouve.

## Conventions de rédaction

- Français, phrases courtes. Dates absolues (`2026-11-04`), jamais « hier » ou « la semaine prochaine ».
- Citer les chemins depuis la racine du repo (`src/modules/myapps/index.ts`), en lien quand c'est utile.
- Une fiche décrit **l'état et les décisions**, pas le code ligne à ligne : le code reste la source de vérité.
- Statuts d'une bascule : `à faire` · `tests écrits` · `basculé` · `joué dans l'app`. Statuts d'un sujet d'assainissement : `à faire` · `en cours` · `fait` · `absorbé par <sujet>` · `sans objet` · `abandonné`. Dans STATUS, un module dont l'assainissement a commencé : `basculé, assainissement en cours`, puis `assaini`. Les anciennes fiches longues (`auth`, `media`, `myapps`, `user`, `wiki`, `explorer`) gardent les leurs : `spec` · `en cours` · `fait` · `nettoyé`.
