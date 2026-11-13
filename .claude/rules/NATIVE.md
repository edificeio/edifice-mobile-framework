---
paths:
  - "android/**"
  - "ios/**"
---

# Règles pour les agents

1. Avant de modifier le code natif iOS (dossier `ìos`) ou Android (dossier `android`), préviens le développeur que tu vas devoir **dé-appliquer l'override avant** avec la commande `yarn override-restore`.

2. Une fois les modifications dans le code natif faites, il faut les commiter.

3. Une fois les modifications dans le code natif comitées, il faut exécuter la commande `node cli/override.js -v --no-i dev/default` et prévenir le développeur. En cas d'échec (identifiants du dépôt manquants…), demander au développeur de lancer la commande `yarn override dev/default` ou un autre override si il le souhaite.
