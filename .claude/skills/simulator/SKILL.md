---
name: simulator
description: Tester l'app mobile Edifice sur un simulateur iOS (iPhone, via le Xcode ouvert du développeur) ou un émulateur Android (AVD Android Studio, via Gradle/adb) — choix de l'appareil, démarrage du simulateur, Metro, build Debug + lancement de l'app, puis vérification à l'écran (capture + LogBox). Utilisé par le skill build-app pour la partie plateforme, et aux étapes « test sur simulateur Android / iOS » du déroulé de ticket (.claude/docs/TICKET-WORKFLOW.md). Peut être utilisé indépendamment quand le développeur demande de lancer ou relancer l'app sur un simulateur / émulateur, ou de capturer son écran. Pour une demande de build (yarn clean, override…), passer par le skill build-app.
argument-hint: <ios|android> ["appareil", ex. "iPhone 17 Pro" ou Pixel_8_API_35]
arguments: [platform, device]
---

# Simulateur (iOS / Android)

## 0. Arguments

- Plateforme : `$platform`
- Appareil : `$device`
- Saisie brute : `$ARGUMENTS`

Règles :

- **Plateforme** : uniquement `ios` ou `android` (insensible à la casse). Vide ou autre valeur (y compris « les deux ») → demande au développeur laquelle des deux. Pour tester les deux plateformes, le skill est invoqué deux fois (Android puis iOS).
- **Appareil** : si le nom contient des espaces et n'a pas été mis entre guillemets, `$device` n'en contient que le premier mot → reconstitue le nom complet à partir de la saisie brute (tout ce qui suit la plateforme).
- **Invocation sans argument** (depuis `build-app` ou le déroulé de ticket `.claude/docs/TICKET-WORKFLOW.md`) : reprends la plateforme et l'appareil déjà donnés dans la conversation ; sinon demande-les.

Ensuite, lis **uniquement** la documentation de la plateforme choisie (ne charge pas l'autre) :

- iOS → [ios.md](ios.md)
- Android → [android.md](android.md)

Les étapes ci-dessous sont communes ; chaque étape marquée **[OS]** renvoie à la section du même nom dans le fichier de la plateforme.

## 1. Cadre

- Le build et le lancement s'inscrivent dans le process commun du skill `build-app` (prérequis, `yarn clean`, override, garde-fous, compte rendu).
- L'app tourne **toujours avec l'override `dev/default`** : vérifie `grep '"override"' override.json`. S'il n'est pas actif, ne lance rien et renvoie vers l'étape « Override » du skill `build-app`.
- Logs et captures vont dans le **scratchpad** (`<scratchpad>` ci-dessous).
- Ne modifie rien dans `ios/` ou `android/` sans accord explicite du développeur.

## 2. Prérequis — [OS]

Section « Prérequis ».

## 3. Choisir l'appareil — [OS]

Section « Choisir l'appareil ». Si `$device` est renseigné, cherche cet appareil ; s'il n'existe pas, signale-le et liste ceux disponibles. Sinon, applique la règle par défaut de la plateforme. **Ne devine jamais** : confirme l'appareil avec le développeur avant de lancer.

## 4. Démarrer le simulateur — [OS]

Section « Démarrer le simulateur ».

## 5. Metro

Commun aux deux plateformes. Vérifie s'il tourne déjà, sinon lance-le **en arrière-plan** :

```bash
curl -s --max-time 2 localhost:8081/status        # "packager-status:running" si déjà lancé
yarn start > <scratchpad>/metro.log 2>&1          # sinon, en arrière-plan
```

Attends `packager-status:running` avant l'étape suivante. Particularités éventuelles : section « Metro » du fichier de la plateforme.

## 6. Builder et lancer l'app — [OS]

Section « Builder et lancer ». Le build est long : lance-le **en arrière-plan**, log dans `<scratchpad>/<plateforme>-build.log`. En cas d'échec, rapporte les premières erreurs, explique la cause probable et **propose** un correctif sans l'appliquer.

## 7. Vérifier l'écran

1. Attends la fin du bundle JS dans `<scratchpad>/metro.log` (barre `BUNDLE … 100%` ou plus de progression).
2. Capture l'écran avec la commande de la section « Capture d'écran » du fichier de la plateforme, puis **lis l'image**.
3. Rapporte ce que tu vois : écran affiché (login, accueil…), **toasts LogBox** d'erreurs/warnings en bas d'écran (nombre + début du message, même s'ils ne viennent pas du ticket), et dialogues système éventuels.

## 8. Navigation dans l'app

À compléter.

## 9. Compte rendu

Plateforme, appareil + version d'OS, Metro (déjà lancé / lancé par toi), résultat du build et du lancement (succès ou échec + premières erreurs), durée approximative, chemins des logs et captures, ce qui a été observé à l'écran. Si une étape n'a pas pu être faite, dis-le explicitement et précise où tu t'es arrêté.
