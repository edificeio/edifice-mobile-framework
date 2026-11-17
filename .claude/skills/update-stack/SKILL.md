---
name: update-stack
description: Mise à jour de la stack technique de l'application mobile Edifice, excepté React Native.
---

# Rappel des règles

- A utilisier UNIQUEMENT quand le développeur le demande explicitement. Ne jamais déclencher ce process de ta propre initiative.
- Ne jamais mettre à jour React Native et ses dépendances.
- Les règles de gestion de `package.json`sont définies dans `.claude/rules/PACKAGE.md`.
- Les règles de gestion du code natif sont définies dans `.claude/rules/PACKAGE.md`.
- Certains packages ont été patchés (dans `patches`). Si un package patché a été mis à jour, refaire le patch en utilisant EXCLUSIVEMENT la commande `yarn patch-package [Nom du package]` et prévenir le développeur que le patch a été mis à jour.
- Ne jamais mettre à jour les dépendances de React Native: `react`, `react-test-renderer`, `react-renderer`, etc. Elles sont fixées par React Native.
- Ne jamais mettre à jour `lottie-ios` sans regarder la version fixée par `lottie-react-native`.

# Mise à jour de la stack technique

## 1. Préparation

- Prévenir le développeur que l'override courant va être retiré et lancer la commande `yarn override-restore`.

## 2. Analyse des dépendances

- Lancer la commande `yarn check-deps` pour savoir quelles dépendances mettre à jour. Cette commande groupe les mises à jour par catégorie: `Patch`, `Minor`, `Major` et `Major version zero`.

## 3. Catégories `Patch`

- Mettre à jour avec la version spécifiée.
- Lancer la commande `yarn clean`pour s'assurer que la mise à jour est ok.
- Lancer la commande `yarn override dev/default`.
- Lancer un build debug iOS en ligne de commande.
- Lancer un build `assembleDebug` Android en ligne de commande.
- En cas d'erreur, prévenir le développeur avant de corriger.
- Retirer l'override en lançant la commande `yarn override-restore`.
- En fin d'opération faire un commit des modifications avec le message `update(stack): patch-level dependency update`.

## 4. Catégorie `Minor`

- Mettre à jour avec la version spécifiée.
- Lancer la commande `yarn clean`pour s'assurer que la mise à jour est ok.
- Lancer la commande `yarn override dev/default`.
- Lancer un build debug iOS en ligne de commande.
- Lancer un build `assembleDebug` Android en ligne de commande.
- En cas d'erreur, prévenir le développeur avant de corriger.
- Retirer l'override en lançant la commande `yarn override-restore`.
- En fin d'opération faire un commit des modifications avec le message `update(stack): minor-level dependency update`.

## 4. Catégorie `Major version zero`

- Mettre à jour avec la version spécifiée.
- Lancer la commande `yarn clean`pour s'assurer que la mise à jour est ok.
- Lancer la commande `yarn override dev/default`.
- Lancer un build debug iOS en ligne de commande.
- Lancer un build `assembleDebug` Android en ligne de commande.
- En cas d'erreur, prévenir le développeur avant de corriger.
- Retirer l'override en lançant la commande `yarn override-restore`.
- En fin d'opération faire un commit des modifications avec le message `update(stack): major-version-zero-level dependency update`.

## 4. Catégorie `Major`

Pour chaque dépendance de cette catégorie:
- Evaluer le risque et l'effort nécessaire pour faire la mise à jour.
- Proposer un plan que le développeur pourra ensuite exécuter unitairement.

## 6. Compte rendu

- Rappeler au développeur quels packages ont été mis à jour et vers quelle version pour chaque catégorie de mise à jour.
- Rappeler au développeur les patches qui ont été mis à jour.
- Rappeler au développeur quels mises à jour peuvent présenter un risque (catégorie `Major version zero`).
- Rappeler au développeur quels packages nécéssitent une mise à jour individuelle (catégorie `Major`).
