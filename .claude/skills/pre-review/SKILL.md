---
name: pre-review
description: Pré-review d'une PR GitHub du dépôt edifice-mobile-framework avant la review humaine.
  Écrit un rapport classé (bloquant / à corriger / mineur / suggestion) avec fichier:ligne et règle citée dans docs/reviews/, sans toucher au code ; une fois le rapport validé par le reviewer, le publie en commentaire sur la PR et propose des évolutions du skill et des règles. À utiliser automatiquement quand je dis « pré-review de la PR 355 », « vérifie la pull request 360 avant que je la relise », « qu'est-ce qui cloche dans la PR 356 », et pour la publication « la pré-review 355 est validée », « publie la pré-review 355 » (`/pre-review 355 publier`). NE PAS utiliser pour relire le diff local non poussé (c'est /code-review) ni pour corriger le code.
argument-hint: '[numéro de PR ou url] [publier]'
allowed-tools: Read Grep Glob Write(docs/reviews/**) Edit(docs/reviews/**) Bash(gh pr view *) Bash(gh pr diff *) Bash(gh pr comment *) Bash(git fetch origin *) Bash(git show *) Bash(git log *) Bash(git diff *) Bash(rm docs/reviews/*)
disallowed-tools: Bash(git commit) Bash(git commit *) Bash(git push) Bash(git push *) Bash(git merge *) Bash(git rebase *) Bash(git cherry-pick *) Bash(git revert *) Bash(git am *)
context: fork
---

# Pré-review d'une PR

Le reviewer humain (tech lead) lance ce skill **avant** de relire une PR. Ton rôle : lui faire gagner du temps en repérant tout ce qui s'écarte des règles écrites de l'équipe et des pièges connus de l'app, pour qu'il puisse se concentrer sur la conception et le fonctionnel.

Deux principes guident tout le reste :

- **Le code et la PR restent intacts.** Pas de `git checkout`, `gh pr checkout`, `gh pr review`, ni d'écriture hors de `docs/reviews/` (dossier ignoré par git). Ta seule écriture est le rapport. Rien ne part sur GitHub sans la validation du reviewer (mode publication, §6) : un commentaire posté à sa place l'engagerait.
- **Chaque remarque est vérifiable.** Elle cite `fichier:ligne` et la règle (fichier + section) qu'elle applique. Une remarque sans règle derrière est une opinion : range-la en « Suggestion » et dis-le. Un faux positif coûte plus cher au reviewer qu'un oubli, car il doit le réfuter.

## 1. Paramètres

`$ARGUMENTS` : un numéro de PR (`355`, `#355`) ou une URL `github.com/edificeio/edifice-mobile-framework/pull/355`, suivi éventuellement de `publier`. Si aucun numéro n'est passé, demande-le et arrête-toi.

- Sans `publier` : **mode rapport** (§2 à §5).
- Avec `publier`, ou si la demande dit que la pré-review est validée : **mode publication** (§6).

## 2. Collecter la PR (lecture seule)

```bash
gh pr view <n> --json number,title,author,state,baseRefName,headRefName,body,commits,files,additions,deletions
gh pr diff <n>            # le diff complet
gh pr diff <n> --name-only
```

Pour lire un fichier **entier** de la branche de la PR (contexte autour d'un hunk, `fr.json`, `rights.ts` du module…) sans checkout :

```bash
git fetch origin <headRefName> --quiet
git show origin/<headRefName>:<chemin>
```

Si la branche vient d'un fork ou que le fetch échoue : `gh api "repos/edificeio/edifice-mobile-framework/contents/<chemin>?ref=<headRefName>" -q .content | base64 -d`.

Le diff seul ne suffit souvent pas : une prop non utilisée, un droit vérifié plus haut, une clé i18n déjà présente ne se voient qu'en ouvrant le fichier. Ouvre-le avant d'affirmer.

**Grosse PR** (> ~40 fichiers ou > ~2 000 lignes) : traite d'abord le code applicatif (`src/`), puis `package.json`, le natif et les assets ; ignore les fichiers générés (lockfiles, `Podfile.lock`, traductions Phrase hors `fr.json`). Liste ce que tu n'as pas lu en « Non vérifié ».

## 3. Charger les règles qui s'appliquent

Lis les règles **depuis le dépôt** (elles évoluent ; ne te fie pas à ta mémoire) dans `.claude/docs` et `.claude/rules`.

`CLAUDE.md` (racine) donne en plus l'architecture et les exemples à imiter (§5) : le module `communities` est la référence, le module `blog` n'en est pas une.

Les règles ne s'appliquent qu'au **code ajouté ou modifié** par la PR. Le code ancien qui les viole déjà n'est pas un reproche à faire à l'auteur — sauf s'il le recopie dans du nouveau code.

`CONVENTIONS.md` liste ce que le lint vérifie déjà (formatage, ordre des imports, clés triées, style inline, `console.log`…). Ne le re-signale pas ligne par ligne : la CI s'en charge. Mentionne au plus « lint à lancer » en « Non vérifié ».

## 4. Ce que tu vérifies

### 4.1 Métadonnées de la PR

- **Branche** : nom `<type>/<squad>/<TICKET>-…` et **base** cohérente avec le modèle de branches (`CONVENTIONS.md` §1) : une branche de travail vise `dev/<squad>`, pas `main` ni `dev/m.n.r`. Les PRs générées (Phrase, release) font exception.
- **Titre** : format de commit `type(scope): TICKET, description en minuscules` (§2). La PR est squashée, le titre devient le commit.
- **Commits** : même format ; signale les commits fourre-tout ou de merge descendant (§1 « Descendre = rebase »).
- **Description** : création d'un composant ou d'une logique alors qu'un équivalent existe → la PR doit le justifier (§10 « Revue »).

### 4.2 Règles du repo

Vérifie l'application des règles chargées à l'étape 3 au code ajouté : structure et nommage des fichiers, `index.ts`, imports `~/`, namespace de types, styles dans `styles.ts` avec valeurs de `theme.ts` / `constants.ts`, i18n, hooks, rendu conditionnel, etc. Cite la section exacte.

### 4.3 Pièges propres à l'app

Passe en revue chaque point de `CONVENTIONS.md` §11 (réseau, droits et profils, session, i18n, dépendances, natif, modèle, robustesse), en vérifiant dans le code et pas seulement dans le diff. Pour l'i18n, ouvre `assets/i18n/fr.json` de la branche.

### 4.4 Overrides et secrets

L'application d'un override réécrit des fichiers suivis par git ; ils ne doivent pas partir dans une PR. Signale en **Bloquant** la présence dans le diff de :

- `override.json`, `phrase.json`, `.phrase.yml`, `src/platforms/**` ;
- fichiers Firebase (`GoogleService-Info.plist`, `google-services.json`) ou tout ce qui ressemble à un jeton, une clé d'API ou un mot de passe.

Ne recopie **jamais** la valeur d'un secret dans le rapport : cite le fichier et la ligne, c'est tout. Le rapport finit sur GitHub.

## 5. Rapport

Gradation :

- **Bloquant** : casse en production, fuite de secret / fichier d'override, faille de droits, régression probable.
- **À corriger** : violation d'une règle écrite de l'équipe, à corriger dans cette PR.
- **Mineur** : écart réel mais sans impact fonctionnel, qui peut être reporté à une PR ultérieure sans bloquer le merge.
- **Suggestion** : amélioration ou avis non couvert par une règle.

Verdict, en fin de rapport, déduit des remarques (il éclaire le reviewer, il ne vaut pas approbation) :

- **Changements requis** : au moins un bloquant.
- **Corrections avant merge** : aucun bloquant, au moins un « à corriger ».
- **Prêt pour la review** : seulement des mineurs ou des suggestions, ou rien.

**Reste concis** : une ligne de constat, une ligne de piste. Omets une section vide plutôt que d'y écrire « rien ».

1. Si `docs/reviews/pr-<n>.md` existe déjà, ne l'écrase pas : signale-le et arrête-toi (le reviewer est peut-être en train de le relire).
2. Écris le rapport en français dans `docs/reviews/pr-<n>.md`, avec le gabarit `.claude/skills/pre-review/templates/report.md`.
3. Écris le même contenu dans `docs/reviews/pr-<n>.generated.md` : cette copie non modifiée sert, à la publication, à voir ce que le reviewer a corrigé.
4. Réponds dans le terminal avec le chemin du rapport, la ligne de synthèse, le verdict et la liste des bloquants. Rappelle au reviewer de relire et d'éditer le fichier, puis de lancer `/pre-review <n> publier` quand il le valide.

## 6. Mode publication

Le reviewer a relu et validé `docs/reviews/pr-<n>.md`, éventuellement après l'avoir modifié. Ce fichier fait foi : publie-le tel quel.

1. Si `docs/reviews/pr-<n>.md` n'existe pas, dis-le et arrête-toi.
2. Publie : `gh pr comment <n> --body-file docs/reviews/pr-<n>.md`. Si la commande échoue, arrête-toi sans rien supprimer.
3. Compare le rapport validé à la copie générée : `git diff --no-index docs/reviews/pr-<n>.generated.md docs/reviews/pr-<n>.md` (si la copie manque, travaille sur le seul rapport validé).
4. Supprime les fichiers locaux : `rm docs/reviews/pr-<n>.md docs/reviews/pr-<n>.generated.md`.
5. Réponds avec l'URL du commentaire, puis propose des évolutions, chacune avec le fichier et la section à modifier, **sans les appliquer** :
   - remarque retirée ou déclassée par le reviewer → faux positif : préciser le skill (§4) ou la règle concernée ;
   - remarque ajoutée ou surclassée par le reviewer → oubli : ajouter la vérification au skill (§4) ou à `CONVENTIONS.md` ;
   - suggestion « sans règle écrite » conservée par le reviewer → règle candidate pour `CONVENTIONS.md` ou `.claude/rules/`.

   Sans écart notable, dis-le en une ligne.
