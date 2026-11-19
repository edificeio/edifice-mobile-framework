---
name: update-stack
description: Mise à jour des dépendances de l'application mobile Edifice (hors React Native et @edifice.io/*), catégorie par catégorie (patch, minor, major version zero), avec clean, builds iOS/Android, type-check, lint et un commit par catégorie ; plan seulement pour les majeures. Lancement manuel uniquement.
argument-hint: "[patch|minor|major-zero|major]"
disable-model-invocation: true
---

# Mise à jour de la stack technique

Ce skill se lance **uniquement** quand le développeur tape `/update-stack` : il touche `package.json`, le natif et crée des commits. Si tu lis ce fichier pour une autre raison (un autre skill, un sous-agent, une demande sans `/update-stack`), arrête-toi et propose au développeur de lancer `/update-stack` lui-même.

## Paramètres

Catégories demandées : `$ARGUMENTS`

- Valeurs acceptées : `patch`, `minor`, `major-zero`, `major` (une ou plusieurs, séparées par des espaces).
- Sans argument : toutes les catégories, dans l'ordre patch → minor → major-zero → major.
- Valeur inconnue : rappelle le format et arrête-toi.

## Règles

- **Exclus de toute mise à jour** :
  - React Native et ce qui suit sa version : `react`, `react-native`, `react-test-renderer`, `@react-native/*`, `@react-native-community/cli*`, `metro*` ;
  - `@edifice.io/*` ;
  - les paquets dont la version est imposée par un autre (peerDependencies). Exemple : `lottie-ios` suit la version attendue par `lottie-react-native`.

  Ces exclusions sont déclarées dans `.ncurc.json` (`reject`), donc `yarn check-deps` ne les propose pas. Si l'un d'eux apparaît quand même, ne le mets pas à jour et signale-le.
- `package.json` : rule `.claude/rules/PACKAGE.md` (versions exactes, `resolutions`).
- Natif (`ios/`, `android/`) : rule `.claude/rules/NATIVE.md`.
- En cas d'erreur (clean, build, type-check, lint) : **préviens le développeur avant de corriger quoi que ce soit**.

## 1. Préparation

1. **Branche** : regarde la branche courante (`git branch --show-current`). Si ce n'est pas une branche `update/…` (CONVENTIONS §1), demande au développeur s'il faut en créer une et sur quelle base. N'en crée pas sans son accord.
2. **Working tree** : `git status` doit être propre, hors fichiers d'override. Sinon, demande au développeur quoi faire des modifications en cours.
3. **Override** : préviens le développeur que l'override courant va être retiré, puis lance `yarn override-restore`.

## 2. Analyse

Lance `yarn check-deps` (`ncu`). Le résultat est groupé en `Patch`, `Minor`, `Major version zero` et `Major`. Montre au développeur la liste des catégories demandées et attends sa confirmation avant de modifier `package.json`.

## 3. Procédure par catégorie (patch, minor, major-zero)

Traite une catégorie à la fois, dans l'ordre. Pour chacune :

1. Mets à jour `package.json` avec les versions proposées pour cette catégorie, en versions exactes : `npx ncu -u --target <patch|minor>`, ou à la main pour `major-zero`.
2. Lance `yarn clean` **en arrière-plan** (plusieurs minutes), log dans le scratchpad :
   ```bash
   yarn clean > <scratchpad>/clean-<categorie>.log 2>&1; echo "EXIT=$?"
   ```
3. **Patches** : `postinstall` applique `patches/*.patch`. Lis la sortie dans le log.
   - Si un paquet patché a changé de version et que le patch s'applique encore : régénère-le avec `yarn patch-package <paquet>`, puis supprime l'ancien fichier `.patch` (son nom contient l'ancienne version).
   - S'il ne s'applique plus : arrête-toi et préviens le développeur, ne réécris pas le patch à l'aveugle.
4. Applique l'override : `node cli/override.js -v --no-i dev/default`.
5. Builds Debug en ligne de commande :
   - iOS : `xcodebuild`, voir `.claude/skills/simulator/IOS.md` § « Alternative sans Xcode ouvert ».
   - Android : `assembleDebug`, voir `.claude/skills/simulator/ANDROID.md` § « Builder et installer (Gradle) ».
6. Lance `yarn ts-all` et `yarn lint-all`.
7. Si une étape échoue : identifie le paquet en cause (log, stack, changelog) et propose au développeur de l'exclure de la catégorie ou de corriger. Attends sa réponse.
8. Retire l'override : `yarn override-restore`.
9. Commite avec le message exact du tableau, sans rien y ajouter :

| Catégorie | Message de commit |
| --- | --- |
| patch | `update(stack): patch-level dependency update` |
| minor | `update(stack): minor-level dependency update` |
| major-zero | `update(stack): major-version-zero-level dependency update` |

## 4. Catégorie `major`

Ne mets rien à jour. Pour chaque dépendance :

- évalue le risque et l'effort (changelog, breaking changes, usages dans `src/`, impact natif) ;
- propose un plan que le développeur exécutera paquet par paquet.

## 5. Compte rendu

- Paquets mis à jour, avec l'ancienne et la nouvelle version, par catégorie.
- Patches régénérés, ou qui ne s'appliquent plus.
- Résultat de chaque étape (clean, build iOS, build Android, ts-all, lint-all) par catégorie. Si une étape n'a pas été lancée, dis-le.
- Mises à jour à risque (catégorie `Major version zero`).
- Paquets qui demandent une mise à jour individuelle (catégorie `Major`), avec le plan.
- Versions disponibles des paquets `@edifice.io/*`.
- À tester par le développeur :
  - en Debug iOS et Android : première connexion, reconnexion automatique ;
  - un build release : `ipa` avec Xcode, `apk` avec Android Studio ou `cd android && ./gradlew assembleRelease`.
