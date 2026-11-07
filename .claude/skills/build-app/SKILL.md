---
name: build-app
description: Process commun pour builder l'application mobile Edifice (iOS ou Android) en Debug sur un simulateur — préparation (yarn install + yarn clean), plateforme et override passés en paramètres (`/build-app [ios|android] [override]`, override dev/default par défaut, appliqué via CONFIG_TO + yarn override-silent), puis build via le skill simulator (`simulator ios` / `simulator android`). À utiliser UNIQUEMENT quand le développeur demande explicitement de lancer un build (« lance un build », « build l'application sur iOS »), ou quand il accepte le build proposé à l'étape de test du déroulé de ticket (.claude/docs/TICKET-WORKFLOW.md). Ne jamais le déclencher de ta propre initiative. NE PAS utiliser pour un build de release / store (scripts prepare-*, Fastlane).
---

# Build de l'application (simulateur)

Ce skill décrit le process **commun aux deux plateformes**. Les commandes de build propres à chaque plateforme sont dans :

- **iOS** → skill `simulator` avec l'argument `ios` (fichier `ios.md`, section « Builder et lancer ») ;
- **Android** → skill `simulator` avec l'argument `android` (fichier `android.md`, section « Builder et lancer »).

## Paramètres

Format : `/build-app [plateforme] [override]`, ex. `/build-app ios neo/test`, `/build-app android`, `/build-app neo/test`.

Paramètres reçus : `$ARGUMENTS`

Les deux sont optionnels. Reconnais-les **par leur valeur, pas par leur position** :

- **`ios`** ou **`android`** → `<plateforme>` ;
- **toute autre valeur** → `<override>` (vérifié à l'étape 3).

Valeurs par défaut :

- **pas de plateforme** → demande-la au développeur (étape 1) ;
- **pas d'override** → `dev/default`.

Si plus de deux paramètres sont passés, ou deux plateformes, ou deux overrides : signale-le, rappelle le format et arrête-toi.

Suis les étapes **dans l'ordre**.

## 1. Prérequis à demander au développeur

- **la plateforme** à builder (iOS, Android ou les deux), **seulement si elle n'a pas été passée en paramètre** ;
- la confirmation que **l'outil de build de la plateforme est installé et accessible** (Xcode pour iOS, Android Studio / SDK pour Android) ;
- **le modèle d'appareil** à utiliser sur le simulateur (et la version d'OS s'il en existe plusieurs) ;
- **si `yarn install && yarn clean` a déjà été fait** (étape 2) ;
- **l'override à appliquer** : ne le demande pas. Il vient des paramètres ; sans override passé, c'est `dev/default` (voir étape 3).

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

L'override à appliquer (`<override>` ci-dessous) est celui identifié dans les **paramètres** (voir « Paramètres »). Si aucun override n'a été passé, `<override>` = **`dev/default`**. N'en choisis jamais un autre toi-même.

Si un override a été passé, vérifie qu'il figure dans la liste des overrides disponibles (dossiers de `__overrides__/` contenant un `override.json`) :

```bash
find __overrides__ -mindepth 2 -name override.json | sed 's#__overrides__/##; s#/override.json##'
```

S'il n'y figure pas, signale-le, montre la liste et arrête-toi.

```bash
grep '"override"' override.json 2>/dev/null   # override actif
```

- **`<override>` déjà actif** → passe à l'étape 4.
- **Pas d'`override.json`, ou un autre override actif** → applique `<override>` toi-même via le script `override-silent` de `package.json`, en settant la variable d'environnement `CONFIG_TO`, et indique-le au développeur :

```bash
CONFIG_TO=<override> yarn override-silent
```

`override-silent` exécute `node cli/override.js -v --no-i $CONFIG_TO` : c'est le shell qui remplace `$CONFIG_TO` par sa valeur. `--no-i` désactive les prompts du CLI : s'il lui manque une info (ex. identifiants du dépôt git des overrides), la commande échoue au lieu d'attendre une saisie. Dans ce cas, rapporte l'erreur et demande au développeur de lancer la commande lui-même (`! CONFIG_TO=<override> yarn override-silent`).

Vérifie ensuite que `override.json` contient `"override": "<override>"`.

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
