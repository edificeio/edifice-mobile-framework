---
name: pre-review
description: Pré-review d'une PR GitHub du dépôt edifice-mobile-framework avant la review humaine.
  Produit un rapport classé (bloquant / à corriger / suggestion) avec fichier:ligne et règle citée, sans toucher au code ni poster sur la PR. À utiliser automatiquement quand je dis « pré-review de la PR 355 », « vérifie la pull request 360 avant que je la relise », « qu'est-ce qui cloche dans la PR 356 »). NE PAS utiliser pour relire le diff local non poussé (c'est /code-review) ni pour corriger le code.
argument-hint: "[numéro de PR ou url]"
allowed-tools: Read Grep Glob Bash(gh pr view *) Bash(gh pr diff *) Bash(git fetch origin *) Bash(git show *) Bash(git log *) Bash(git diff *)
disallowed-tools: Edit Write Bash(git commit) Bash(git commit *) Bash(git push) Bash(git push *) Bash(git merge *) Bash(git rebase *) Bash(git cherry-pick *) Bash(git revert *) Bash(git am *)
context: fork
---

# Pré-review d'une PR

Le reviewer humain (tech lead) lance ce skill **avant** de relire une PR. Ton rôle : lui faire gagner du temps en repérant tout ce qui s'écarte des règles écrites de l'équipe et des pièges connus de l'app, pour qu'il puisse se concentrer sur la conception et le fonctionnel.

Deux principes guident tout le reste :

- **Lecture seule.** Tu ne modifies ni le working tree, ni la branche, ni la PR. Pas de `git checkout`, pas de `gh pr checkout`, pas de `gh pr comment` / `gh pr review`. Le reviewer décide lui-même de ce qu'il remonte à l'auteur ; un commentaire posté à sa place l'engagerait.
- **Chaque remarque est vérifiable.** Elle cite `fichier:ligne` et la règle (fichier + section) qu'elle applique. Une remarque sans règle derrière est une opinion : range-la en « Suggestion » et dis-le. Un faux positif coûte plus cher au reviewer qu'un oubli, car il doit le réfuter.

## 1. Paramètre

PR reçue : `$ARGUMENTS` — un numéro (`355`, `#355`) ou une URL `github.com/edificeio/edifice-mobile-framework/pull/355`. Si rien n'est passé, demande le numéro et arrête-toi.

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
- **Description** : création d'un composant ou d'une logique alors qu'un équivalent existe → la PR doit le justifier (§9 « Revue »).

### 4.2 Règles du repo

Applique les règles chargées à l'étape 3 au code ajouté : structure et nommage des fichiers, `index.ts`, imports `~/`, namespace de types, styles dans `styles.ts` avec valeurs de `theme.ts` / `constants.ts`, i18n, hooks, rendu conditionnel, etc. Cite la section exacte.

### 4.3 Pièges propres à l'app Edifice

Ce sont les erreurs que le lint ne voit pas et qui cassent en production. Pour chacune, vérifie dans le code, pas seulement dans le diff :

- **Réseau** : un `fetch` (ou `axios`) direct dans un écran ou un composant, au lieu de `src/framework/util/transport` et du `service/` du module.
- **Droits et profils** : une fonctionnalité, un bouton ou un écran affiché sans vérifier les droits (`rights.ts` du module, `resourceRights.ts`) ou le profil (élève, parent, enseignant). Demande-toi : que voit un élève ? un parent sans enfant rattaché ?
- **Session** : code qui lit ou stocke le token, ou appelle une API hors de la session gérée par `src/framework/util/oauth2.ts` / le module `auth` (refresh, expiration, déconnexion).
- **i18n** : texte en dur, clé absente de `assets/i18n/fr.json` (ouvre le fichier de la branche), clé qui ne suit pas `module-screen-key`, **valeur existante modifiée** (à inventorier pour l'équipe, §8).
- **Dépendances** : ajout ou montée de version dans `package.json`, un Pod ou Gradle. Version non exacte (`^`, `~`), dépendance applicative qui aurait pu être de dev (`PACKAGE.md`). Une nouvelle dépendance doit être annoncée dans la description.
- **Natif** : toute modification sous `ios/` ou `android/` mérite une ligne dans le rapport (impact sur les overrides, `NATIVE.md`).
- **Modèle** : nouveau code calqué sur le module `blog` ou sur un ancien fichier en camelCase, alors que `communities` montre la bonne façon.
- **Robustesse** : erreurs réseau non gérées (pas d'état d'erreur, promesse non catchée), état de chargement absent, `0 && <X />`, listes longues en `ScrollView`.

### 4.4 Overrides et secrets

L'application d'un override réécrit des fichiers suivis par git ; ils ne doivent pas partir dans une PR. Signale en **Bloquant** la présence dans le diff de :

- `override.json`, `phrase.json`, `.phrase.yml`, `src/platforms/**` ;
- fichiers Firebase (`GoogleService-Info.plist`, `google-services.json`) ou tout ce qui ressemble à un jeton, une clé d'API ou un mot de passe.

Ne recopie **jamais** la valeur d'un secret dans le rapport : cite le fichier et la ligne, c'est tout. Le rapport peut être collé ailleurs.

## 5. Rapport

En français, dans le terminal, avec ce gabarit. Sois concis : une ligne de constat, une ligne de piste. Omets une section vide plutôt que d'y écrire « rien ».

```markdown
# Pré-review PR #<n> — <titre>

**Auteur** : <login> · **Branche** : `<head>` → `<base>` · **Taille** : <fichiers> fichiers, +<add>/-<del>
**En bref** : <ce que fait la PR, en une phrase>
**Règles appliquées** : CONVENTIONS, SCREENS, DESIGN-SYSTEM, …

## Bloquant
- `src/…/screen.tsx:42` — <constat>. *Règle* : CONVENTIONS §8 i18n. *Piste* : <correction>.

## À corriger
- …

## Suggestions
- … (préciser « sans règle écrite » quand c'est un avis)

## Points à vérifier par le reviewer
- <ce qui ne se tranche pas en lisant le diff : rendu UI, comportement par profil, test iOS/Android, choix de conception>

## Non vérifié
- `yarn ts-all` / `yarn lint-all` non lancés (pas de checkout).
- <fichiers non lus, faute de temps ou parce que générés>
```

Gradation :

- **Bloquant** : casse en production, fuite de secret / fichier d'override, faille de droits, régression probable.
- **À corriger** : violation d'une règle écrite de l'équipe.
- **Suggestion** : amélioration ou avis non couvert par une règle.

Termine par une ligne de synthèse (`<x> bloquants, <y> à corriger, <z> suggestions`). Ne propose pas de poster les remarques sur la PR.
