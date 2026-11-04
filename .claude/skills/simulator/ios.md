# iOS — spécificités

On pilote **le Xcode ouvert du développeur** avec AppleScript (`osascript`) : Xcode builde avec son scheme actif (`appe`, Debug), installe l'app et la lance sur le simulateur choisi, exactement comme un clic sur ▶︎ Run.

## Prérequis

- Xcode est **ouvert sur `ios/appe.xcworkspace`** :
  ```bash
  osascript -e 'tell application "Xcode" to get {name, path} of active workspace document'
  ```
- Au premier appel, macOS demande d'autoriser le terminal à contrôler Xcode (Réglages Système > Confidentialité > Automatisation) : demande au développeur de valider.
- Pods à jour : `diff -q ios/Podfile.lock ios/Pods/Manifest.lock`. Sinon, propose `cd ios && pod install` et attends l'accord.

## Choisir l'appareil

On identifie le simulateur par son **UDID**.

**Appareil précisé** (ex. « iPhone 17 Pro ») → liste les destinations connues d'Xcode et repère l'UDID :

```bash
osascript -e 'tell application "Xcode"
set out to ""
repeat with d in (run destinations of active workspace document)
  try
    set out to out & (name of d) & " | " & (device identifier of device of d) & linefeed
  end try
end repeat
return out
end tell' | grep -i "iphone"
```

Les noms incluent la version d'iOS (ex. `iPhone 17 (26.0)`). S'il existe plusieurs versions et qu'il n'en a pas précisé, demande-lui laquelle.

**Rien de précisé** → prends **le simulateur sélectionné dans son Xcode**. Il est stocké dans l'état d'interface du workspace :

```bash
plutil -convert xml1 -o - ios/appe.xcworkspace/xcuserdata/$(whoami).xcuserdatad/UserInterfaceState.xcuserstate \
  | grep -oE "dvtdevice-iphonesimulator:[0-9A-F-]{36}" | head -1
```

Puis donne au développeur le nom et la version correspondants (`xcrun simctl list devices | grep <UDID>`) **avant de lancer**, pour qu'il confirme.

- Ne pas utiliser `active run destination` en AppleScript pour **lire** la sélection : sur Xcode 26 il renvoie `missing value`.
- Ce fichier est écrit par Xcode avec un léger différé : si le développeur vient de changer de simulateur, demande-lui de confirmer.

## Démarrer le simulateur

Rien à faire : Xcode démarre le simulateur lui-même au Run (étape « Builder et lancer »).

## Metro

Le projet n'a pas de phase « Start Packager » : Xcode ne démarre pas Metro, il faut le lancer soi-même (étape commune).

## Builder et lancer

### 1. Lancer le Run dans Xcode

```bash
osascript -e 'tell application "Xcode"
set ws to active workspace document
set chosenDest to missing value
repeat with d in (run destinations of ws)
  try
    if (device identifier of device of d) is "<UDID>" then set chosenDest to contents of d
  end try
end repeat
if chosenDest is missing value then return "DEST NOT FOUND"
set active run destination of ws to chosenDest
set r to run ws
return "RUN STARTED: " & (status of r as text)
end tell'
```

- **Ne nomme pas de variable `target`** : c'est un mot réservé du dictionnaire AppleScript d'Xcode (erreur `-10003`).
- `set active run destination` fonctionne en écriture, même si la lecture renvoie `missing value`.

### 2. Attendre la fin du build et le lancement

En arrière-plan, boucle toutes les 5 s jusqu'à un état final :

```bash
# Statut de l'action Xcode : not yet started | running | succeeded | failed | error occurred | cancelled
osascript -e 'tell application "Xcode" to get (status of last scheme action result of active workspace document) as text'
# L'app tourne-t-elle sur le simulateur ? (bundle id iOS = clé "appid.ios" de override.json)
xcrun simctl spawn <UDID> launchctl list | grep -c "<appid.ios>"
```

- **Succès** : l'app apparaît dans `launchctl list` (le statut Xcode reste `running` tant que l'app tourne, c'est normal).
- **Échec** (`failed`, `error occurred`, `cancelled`) : récupère le message et rapporte-le :
  ```bash
  osascript -e 'tell application "Xcode" to get error message of last scheme action result of active workspace document'
  ```
- Repère de durée : ~1 min pour un build incrémental ; bien plus après un `yarn clean`.

### Alternative sans Xcode ouvert (build seul, en ligne de commande)

Si le développeur ne peut pas ouvrir Xcode, `xcodebuild` builde sans lancer l'app (même toolchain et même DerivedData) :

```bash
xcodebuild -workspace ios/appe.xcworkspace -scheme appe -configuration Debug -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,id=<UDID>' build > <scratchpad>/ios-build.log 2>&1; echo "EXIT=$?"
grep -E "\*\* BUILD (SUCCEEDED|FAILED) \*\*" <scratchpad>/ios-build.log
grep -E "^[^ ].*: error: " <scratchpad>/ios-build.log | sort -u | head -30
```

Ne cherche pas simplement `error:` : les warnings des Pods contiennent `error:` dans leurs extraits de code (faux positifs). Repère : ~4 min avec cache.

## Capture d'écran

```bash
xcrun simctl io <UDID> screenshot <scratchpad>/ios-screen.png
```
