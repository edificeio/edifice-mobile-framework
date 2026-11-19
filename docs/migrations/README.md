# Migrations : suivi

Suivi de la migration de l'ancienne génération de code (modules `NavigableModule`, navigation dynamique, redux) vers la nouvelle (`CoreModule` / `EntModule`, navigation statique, zustand). Le contexte technique est dans [ARCHITECTURE.md](../ARCHITECTURE.md).

**À lire en premier : [INTENT.md](INTENT.md)** (pourquoi on migre, ce qui est dans la migration, comment on la mène, quand elle est finie).

Ce dossier sert de **mémoire partagée entre les sessions** (humaines ou Claude) : une session qui reprend le sujet doit pouvoir savoir où on en est sans relire l'historique git.

## Fichiers

| Fichier                          | Contenu                                                                           |
| -------------------------------- | --------------------------------------------------------------------------------- |
| [INTENT.md](INTENT.md)           | Intention de la migration : contexte, périmètre, règles de conduite, définition de « terminé » |
| [SUIVI.md](SUIVI.md)             | Suivi **calculé** par `yarn migration-status` : compteurs par module (ne pas modifier à la main) |
| [STATUS.md](STATUS.md)           | Tableau de bord : état de chaque module et chantier, prochaines étapes            |
| [BASCULE.md](BASCULE.md)         | Patron de la bascule d'un module (étape 1 d'INTENT) : gestes, conditions d'arrêt, vérification |
| [JOURNAL.md](JOURNAL.md)         | Journal daté des sessions (ajout en tête, jamais réécrit)                         |
| [CONVENTIONS.md](CONVENTIONS.md) | Règles valables pour toute la migration (portage, UI, nommage, données)           |
| [later.md](later.md)             | Plus tard : sujets reportés et décisions à revoir                                 |
| [auth.md](auth.md)               | Fiche du module `auth` (fait, reste à faire, décisions)                           |
| [media.md](media.md)             | Fiche du module `media`                                                           |
| [myapps.md](myapps.md)           | Spécification de la migration de `myapps` (à valider)                             |
| [user.md](user.md)               | Fiche de `user` : plan validé en attente, `entries` (points d'entrée des modules) |
| [timeline.md](timeline.md)       | Fiche de `timeline` (pas encore spécifiée) : découpage avec `notifications`       |
| [wiki.md](wiki.md)               | Fiche de `wiki` : spécifiée, en attente des préalables `explorer` et `audience`   |
| [support.md](support.md)         | Fiche de `support` : premier module passé par la bascule seule, pas joué dans l'app |
| [\_template.md](_template.md)    | Gabarit d'une fiche de module                                                     |
| [\_template-bascule.md](_template-bascule.md) | Gabarit court de l'intention d'un module pour une bascule seule |

## Protocole d'une session

Pour migrer un module avec Claude Code : `/migrate-module <chemin du module>` (skill `.claude/skills/migrate-module/`, lancé à la main). Il suit ce protocole, écrit la fiche et le plan, puis exécute les phases une à une avec validation. Il reprend où on en était si la fiche existe déjà.

**En début de session**

1. Lire [STATUS.md](STATUS.md) et [later.md](later.md) (ce qu'il ne faut pas démarrer), puis les 2-3 dernières entrées de [JOURNAL.md](JOURNAL.md).
2. Lire [CONVENTIONS.md](CONVENTIONS.md), puis la fiche du module concerné. Ses « Décisions » sont acquises : ne pas les rediscuter sans raison nouvelle. Ses « Questions ouvertes » se tranchent **avec l'utilisateur**, pas en autonomie.
3. Vérifier que les fichiers et symboles cités existent toujours (les fiches peuvent avoir vieilli).

**Pendant**

- Travailler phase par phase : proposer, faire valider, puis écrire. Une phase = un état qui compile et qu'on peut tester.
- Noter une décision dans la fiche dès qu'elle est prise (avec la raison en une ligne).

**En fin de session** (même interrompue)

1. Ajouter une entrée en tête de [JOURNAL.md](JOURNAL.md) : fait, décidé, en suspens, prochaine étape.
2. Mettre à jour la ligne du module dans [STATUS.md](STATUS.md) et la section « Avancement » de sa fiche.
3. Relancer `yarn migration-status` et commiter [SUIVI.md](SUIVI.md) avec le reste.
4. Laisser des marqueurs `ToDo(<module>-migration): …` dans le code pour ce qui est volontairement reporté : `grep -rn "migration)" src` les retrouve.

## Conventions de rédaction

- Français, phrases courtes. Dates absolues (`2026-11-04`), jamais « hier » ou « la semaine prochaine ».
- Citer les chemins depuis la racine du repo (`src/modules/myapps/index.ts`), en lien quand c'est utile.
- Une fiche décrit **l'état et les décisions**, pas le code ligne à ligne : le code reste la source de vérité.
- Statuts utilisés partout : `à faire` · `spec` (spécifié, pas commencé) · `en cours` · `fait` (fonctionnel, legacy encore présent) · `nettoyé` (legacy supprimé).
