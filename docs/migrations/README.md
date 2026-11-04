# Migrations : suivi

Suivi de la migration de l'ancienne génération de code (modules `NavigableModule`, navigation dynamique, redux) vers la nouvelle (`CoreModule` / `EntModule`, navigation statique, zustand). Le contexte technique est dans [ARCHITECTURE.md](../ARCHITECTURE.md).

Ce dossier sert de **mémoire partagée entre les sessions** (humaines ou Claude) : une session qui reprend le sujet doit pouvoir savoir où on en est sans relire l'historique git.

## Fichiers

| Fichier                       | Contenu                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| [STATUS.md](STATUS.md)        | Tableau de bord : état de chaque module et chantier, prochaines étapes |
| [JOURNAL.md](JOURNAL.md)      | Journal daté des sessions (ajout en tête, jamais réécrit)              |
| [auth.md](auth.md)            | Fiche du module `auth` (fait, reste à faire, décisions)                |
| [media.md](media.md)          | Fiche du module `media`                                                |
| [myapps.md](myapps.md)        | Spécification de la migration de `myapps` (à valider)                  |
| [\_template.md](_template.md) | Gabarit d'une fiche de module                                          |

## Protocole d'une session

**En début de session**

1. Lire [STATUS.md](STATUS.md), puis les 2-3 dernières entrées de [JOURNAL.md](JOURNAL.md).
2. Lire la fiche du module concerné. Ses « Décisions » sont acquises : ne pas les rediscuter sans raison nouvelle. Ses « Questions ouvertes » se tranchent **avec l'utilisateur**, pas en autonomie.
3. Vérifier que les fichiers et symboles cités existent toujours (les fiches peuvent avoir vieilli).

**Pendant**

- Travailler phase par phase : proposer, faire valider, puis écrire. Une phase = un état qui compile et qu'on peut tester.
- Noter une décision dans la fiche dès qu'elle est prise (avec la raison en une ligne).

**En fin de session** (même interrompue)

1. Ajouter une entrée en tête de [JOURNAL.md](JOURNAL.md) : fait, décidé, en suspens, prochaine étape.
2. Mettre à jour la ligne du module dans [STATUS.md](STATUS.md) et la section « Avancement » de sa fiche.
3. Laisser des marqueurs `ToDo(<module>-migration): …` dans le code pour ce qui est volontairement reporté : `grep -rn "migration)" src` les retrouve.

## Conventions de rédaction

- Français, phrases courtes. Dates absolues (`2026-11-04`), jamais « hier » ou « la semaine prochaine ».
- Citer les chemins depuis la racine du repo (`src/modules/myapps/index.ts`), en lien quand c'est utile.
- Une fiche décrit **l'état et les décisions**, pas le code ligne à ligne : le code reste la source de vérité.
- Statuts utilisés partout : `à faire` · `spec` (spécifié, pas commencé) · `en cours` · `fait` (fonctionnel, legacy encore présent) · `nettoyé` (legacy supprimé).
