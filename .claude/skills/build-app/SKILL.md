---
name: build-app
description: Process commun pour builder l'app mobile Edifice (iOS ou Android) en Debug sur un simulateur — préparation (yarn install + yarn clean), activation de l'override dev/default, puis build via le skill simulator (`simulator ios` / `simulator android`). À utiliser UNIQUEMENT quand le développeur demande explicitement de lancer un build (« lance un build », « builde l'app sur iOS »), ou quand il accepte le build proposé à l'étape de test du déroulé de ticket (.claude/docs/TICKET-WORKFLOW.md). Ne jamais le déclencher de ta propre initiative. NE PAS utiliser pour un build de release / store (scripts prepare-*, Fastlane).
---

# Build de l'app (simulateur)

Ce skill décrit le process **commun aux deux plateformes**. Les commandes de build propres à chaque plateforme sont dans :

- **iOS** → skill `simulator` avec l'argument `ios` (fichier `ios.md`, section « Builder et lancer ») ;
- **Android** → skill `simulator` avec l'argument `android` (fichier `android.md`, section « Builder et lancer »).

Suis les étapes **dans l'ordre**.

## 1. Prérequis à demander au développeur

- **la plateforme** à builder (iOS, Android ou les deux) ;
- la confirmation que **l'outil de build de la plateforme est installé et accessible** (Xcode pour iOS, Android Studio / SDK pour Android) ;
- **le modèle d'appareil** à utiliser sur le simulateur (et la version d'OS s'il en existe plusieurs) ;
- **si `yarn install && yarn clean` a déjà été fait** (étape 2).

Rappelle-lui de **ne pas lancer de build depuis l'IDE en même temps** : les deux partageraient le même cache de build et se bloqueraient.

## 2. Installation et nettoyage

Si le développeur confirme que `yarn install && yarn clean` a été fait, passe à l'étape 3. Sinon, lance-le toi-même, **en arrière-plan** (plusieurs minutes), avec le log dans le scratchpad :

```bash
{ yarn install && yarn clean; } > <scratchpad>/clean.log 2>&1
echo "EXIT=$?"
```

Ce que fait `yarn clean` (voir `package.json`) : vide ccache, supprime `node_modules`, les builds iOS/Android, `ios/Pods` et `ios/Podfile.lock`, puis réinstalle tout (`bundle install`, `yarn install`, `gradlew clean`, `pod install --repo-update`) et vide le cache des overrides (`override.js reset-cache`).

En cas d'échec, rapporte l'erreur et arrête-toi : ne passe pas à la suite.

## 3. Override

On builde **toujours avec l'override `dev/default`**. Ne te préoccupe pas des autres overrides et ne demande pas lequel utiliser.

```bash
grep '"override"' override.json 2>/dev/null   # override actif
```

- **`dev/default` déjà actif** → passe à l'étape 4.
- **Pas d'`override.json`, ou un autre override actif** → applique `dev/default` toi-même, en mode non interactif, et indique-le au développeur :

```bash
node cli/override.js -v --no-i dev/default
```

`--no-i` désactive les prompts du CLI : s'il lui manque une info (ex. identifiants du repo git des overrides), la commande échoue au lieu d'attendre une saisie. Dans ce cas, rapporte l'erreur et demande au développeur de lancer la commande lui-même (`! node cli/override.js -v dev/default`).

Vérifie ensuite que `override.json` contient `"override": "dev/default"`.

## 4. Lancer le build

- Suis l'étape « Builder et lancer » du skill `simulator` pour la plateforme.
- Le build est long : lance-le **en arrière-plan**, log dans `<scratchpad>/<plateforme>-build.log`.
- Pour les deux plateformes, builde l'une après l'autre (Android puis iOS).

## 5. Garde-fous

Sans accord explicite du développeur, ne lance jamais :

- un autre script qui supprime des dépendances, des lockfiles ou des caches (`yarn pod-install`, suppression de DerivedData…) — `yarn clean` n'est lancé que dans le cadre de l'étape 2 ;
- de modification dans `ios/` ou `android/` (projet, Podfile, Gradle, réglages de build) pour faire passer un build.

En cas d'échec, rapporte l'erreur, explique la cause probable et **propose** un correctif.

## 6. Compte rendu

Pour chaque plateforme : `yarn clean` lancé ou non, override actif, appareil et version d'OS du simulateur, résultat (succès ou échec + premières erreurs), durée approximative, chemin des logs. Si une étape n'a pas pu être faite, dis-le.
