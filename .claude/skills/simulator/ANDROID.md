# Android — spécificités

Android Studio ne se pilote pas par script (pas d'équivalent de l'AppleScript d'Xcode). On utilise donc **les outils du SDK installé par Android Studio**, ceux que Studio appelle lui-même : `emulator` pour démarrer l'AVD, **Gradle** (`./gradlew`) pour builder et installer, `adb` pour lancer l'application et l'observer.

Utilise toujours `-s <serial>` (ex. `emulator-5554`) dans les commandes `adb` si plusieurs appareils sont connectés.

## Prérequis

```bash
echo $ANDROID_HOME                       # SDK Android Studio (ex. ~/Library/Android/sdk)
java -version                            # JDK utilisé par Gradle
$ANDROID_HOME/emulator/emulator -list-avds
```

## Choisir l'appareil

On identifie l'émulateur par le nom de son **AVD**.

- **Appareil précisé** → prends l'AVD correspondant dans `-list-avds`.
- **Rien de précisé** → **demande au développeur quel appareil est sélectionné dans son Android Studio**, en lui proposant la liste `-list-avds`. Android Studio ne l'enregistre pas de façon fiable : `android/.idea/deploymentTargetSelector.xml` ne contient pas forcément de device.

N'utilise pas Genymotion.

## Démarrer le simulateur

S'il n'est pas déjà lancé (`adb devices -l`), démarre-le en arrière-plan puis attends la fin du boot :

```bash
nohup $ANDROID_HOME/emulator/emulator -avd <AVD> -no-snapshot-save > <scratchpad>/emulator.log 2>&1 &
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 2; done
adb -s emulator-5554 emu avd name      # vérifie que c'est bien l'AVD voulu
```

## Metro

En Debug, l'application joint Metro sur **`10.0.2.2:8081`** (alias du Mac vu depuis l'émulateur Android Studio). En complément, sans danger et utile si l'application vise `localhost` :

```bash
adb -s <serial> reverse tcp:8081 tcp:8081
```

## Builder et lancer

### 1. Builder et installer (Gradle)

Debug, en arrière-plan, log dans le scratchpad. `-PreactNativeArchitectures` limite la compilation native à l'architecture de l'émulateur (sinon les 4 ABI sont compilées) :

```bash
ABI=$(adb -s <serial> shell getprop ro.product.cpu.abi | tr -d '\r')   # ex. arm64-v8a
cd android && ./gradlew installDebug -PreactNativeArchitectures=$ABI > <scratchpad>/android-build.log 2>&1
echo "EXIT=$?"
grep -E "BUILD (SUCCESSFUL|FAILED)|Installed on|What went wrong" -A3 <scratchpad>/android-build.log
```

- **Succès** : `BUILD SUCCESSFUL` et `Installed on 1 device`.
- **Échec** : rapporte le bloc `What went wrong` et les erreurs Kotlin/Java (lignes `e: `).
- Repère de durée : ~11 min pour un build complet des 4 ABI ; plus court en limitant à une ABI et en build incrémental.

### 2. Lancer l'application

**Réveille d'abord l'écran de l'émulateur** : écran éteint, Android coupe le réseau de l'application, qui ne joint pas Metro et crashe avec `Unable to load script` (et la capture d'écran est noire).

```bash
adb -s <serial> shell input keyevent KEYCODE_WAKEUP
adb -s <serial> shell wm dismiss-keyguard
adb -s <serial> shell am force-stop <appid>
adb -s <serial> shell am start -n <appid>/com.ode.appe.MainActivity
```

- `<appid>` = clé `"appid"` de `override.json` (dépend de l'override actif). L'activité est `com.ode.appe.MainActivity` (`adb shell cmd package resolve-activity --brief <appid>` pour vérifier).
- Surveille un crash pendant ~60 s : `adb -s <serial> logcat -d 'AndroidRuntime:E' '*:S' | grep FATAL`. En cas de crash, rapporte l'exception (lignes qui ne commencent pas par `at `).

## Capture d'écran

```bash
adb -s <serial> exec-out screencap -p > <scratchpad>/android-screen.png
```

Sur les images Android 16 « 16 KB page size » (`sdk_gphone16k`), un dialogue système « This app isn't 16 KB compatible » s'affiche au lancement : il est informatif, signale-le sans le traiter comme une erreur du ticket.
