# App.e :  ODE Mobile Plateform : Developer guide  

## Setup environment

Follow the guide [for Mac/iOS](./install-apple.md) or [for Android (soon)](http://www.theuselessweb.com/).

## Install environment (legacy version)

// TODO : Remove this part in favour of `install-android.md` guide.

This section sums up [React Native Get Started documentation](https://facebook.github.io/react-native/docs/getting-started.html) to **Building Projects with native code** on **Linux**. It gives additionnal troubleshooting's notes 

> **CAUTION** This installation process is tested for **React Native 0.55**. Retrieve other versions [here](https://facebook.github.io/react-native/versions.html) 

### Node 10

[Follow your Linux's distribution instruction](https://nodejs.org/en/download/package-manager/)

### React Native CLI

`npm` CLI comes with `node`. Run the following command to install `react-native-cli`
```bash
npm install -g react-native-cli
```
### JDK 8+ 

http://www.oracle.com/technetwork/java/javase/downloads/jdk8-downloads-2133151.html

//TODO : document installation with package

### Android development environment

1. [Install Android Studio](https://facebook.github.io/react-native/docs/getting-started.html#1-install-android-studio)
    - `unzip -d . ~/Download/android-studio-ide-173.4720617-linux.zip`
    - `./android-studio/bin/studio.sh` 
    - > **CAUTION** `/tmp` folder's size must > 5Go. Follow the next instruction to increase `/tmp` size  

      ```bash
      # As root 
      vi /etc/fstab 
      # add or edit the line
      none /tmp tmpfs size=8G 0 0 
      # As root
      mount -a
      ```

2. [Install Android SDK](https://facebook.github.io/react-native/docs/getting-started.html#2-install-the-android-sdk)
    - **Android 6.0 (Marshmallow) SDK is required** for React Native

3. [Configure the ANDROID_HOME environement variable](https://facebook.github.io/react-native/docs/getting-started.html#android-development-environment)

## Prepare Android Device 

1. Sart a new Android Studio project

2. [Configure an Android Virtual Devices (AVD)](https://facebook.github.io/react-native/docs/getting-started.html#preparing-the-android-device)

3. [Test installation with a fresh React Native project](https://facebook.github.io/react-native/docs/getting-started.html#running-your-react-native-application-2
)
    ```bash
    react-native init AwesomeProject # create a new project
    cd AwesomeProject
    react-native run-android # launch your project into your AVD
    ```
    > **TROUBLESHOOTING** : if you encounter an error like `Cannot run program "/Android/Sdk/build-tools/23.0.1/aapt: error=2` you need to install some package. See [#react-native/issues/17753](https://github.com/facebook/react-native/issues/17753)

## Develop with App.e code

### Default development workflow

```bash
# Clone this repository
git clone http://code.web-education.net/ODE/mobile-app.git
# Install it
npm install
# link all natives dependencies // // TODO check precisely when it is requiered 
react-native link 
# Create a keystore for APK // TODO check if required for dev install 
npm run private-key
# Launch dev server
npm start
# Watch and build
npm run tsc
# View in Android
npm run android
```

> **TROUBLESHOOTING** : if output of command `npm run android` display a message like `Project with path ':react-native-<SOME_MODULE>' could not be found in project ':app'` you propably need to link the specified module by executing  `react-native link react-native-<SOME_MODULE>`

COMMIT CHANGE OF CONF https://rnfirebase.io/docs/v4.2.x/installation/android

### NPM specific's App.e command reference

You can run the following commanf from App.e root directory to manage your project

```bash
    npm run build:ios       # build an IOS's application
    npm run android         # run the APK, on a connected Android (USB device or AVD), in debug mode.
    npm run apk             # build an APK
    npm run clean           # Remove generated files
    npm run cleanGenerated  # Remove generated files with rimraf //TODO difference with clean ?
    npm run fake-server     # Run a mocked API server //TODO how to configure ?
    npm run ios             # run application on Iphone (from XCode) in debug mode
    npm run prettier        # preatty format ts and tsx files
    npm run prettier1       # preatty format ts files 
    npm run prettier2       # preatty format tsx files
    npm run private-key     # create a keystore (//TODO rename)
    npm run react-devtools  # run react-devtools (to inspect react component whith broser extension)  
    npm start               # launch development's server
    npm run test            # run test with Jest (//TODO describe...)
    npm run tsc:build       # compile ts files 
    npm run tsc             # watch and compile ts files. Your code modification are "just in time" compiled.  
    npm run tslint          #
    npm run upgrade         # upgrade react-native version ()
```

## Modification répertoire Android

//TODO must be keep ?

* Utilisation de Proguard pour la génération

Fichier modifié:

```bash
./android/app/build.gradle
```

Contient aussi le paramètre de proguard (voir generation apk à la suite du document)

## Build vector icon

Les icones vectoriels (svg) seront mis dans une font au format truetype (ttf).

Les icones doivent respecter certaines conditions pour etre transformé en police truetype par l'outil icomoon: https://icomoon.io/app/#/select

On utilisera l'outil Inkscape pour verifier la conformité de l'icone SVG:

* Ouvrir l'icone
* Selectioner l'ensemble de l'icone
* File --> Document Propertie : select "resize page to drawing or selection"
* monochrome
* Object --> Group
* Path --> Union
* Path --> Combine
* File --> Cleanup Document
* File --> Save

L'outil Gravit est bien aussi pour modifier l'icone SVG

## Generate Font

Ouvrir le site https://icomoon.io/app/#/select

* Prendre l'ensemble des icones SVG de l'application et les droper ds Icomoon
* Selectionner l'ensemble des icones dans Icomoon
* Generer le fichier de font
* Extraire du fichier le fichier json et ttf pour les mettre dans le repertoire assets/font

## Install

```bash
npm install
```
 => RDJE : not met this bug => remove this section ?
* Un bug dans react-native oblige à supprimer le fichier package.json situé sous
  `node_modules/react-native/local-cli/core/__fixtures__/files`
* react-native-vector-icons and react-native 0.52 on Android

```
Error: While trying to resolve module `react-native-vector-icons` from file `mobile-app/build/components/ui/icons/Icon.js`, the package `/mobile-app/node_modules/react-native/local-cli/core/__fixtures__/files/package.json` was successfully found.
```

Quick fix:
[react-native-vector-icons#626](https://github.com/oblador/react-native-vector-icons/issues/626)


## Firebase configuration

### Analytics

Analytics tags are sended by batch. So you will not see them instantly in firebase console. [Enable debug View](https://support.google.com/firebase/answer/7201382?hl=en) to consult them gradualy.

Follow this steps:

* Android
  To enable Analytics Debug mode on an emulated Android device, execute the following command lines:

  ```bash
  adb shell setprop debug.firebase.analytics.app com.ode.appe
  ```
  This behavior persists until you explicitly disable Debug mode by executing the following command line :
  ```bash
  adb shell setprop debug.firebase.analytics.app .none.
  ```

* iOS
  To enable Analytics Debug mode on your development device, append the following command line argument in Xcode : `-FIRDebugEnabled`

  This behavior persists until you explicitly disable Debug mode by appending the following command line argument: `--FIRDebugDisabled`

## Release instrcutions

### Sign your APK

The APK must be signed with a key, so that it can be run on an Android device. cf : https://developer.android.com/studio/publish/app-signing.html

**Important : The application must use the same key.**

Android Studio signs the APK with debug. Don't use it for release versions.

- Import the android folder as android project
-  You can build and run it as normal android prject

```bash
# build a new APK (it will be generated in android/app/build/outputs/apk/)
npm run apk
# create a Keystore (if the Keystore file does not exist)
nmp run privete-key
# zipalign the APK  (optional)
zipalign 4 <apk-file>
# Sign the APK  (apksigner is in $ANDROID_HOME/build-tools)
apksigner sign --ks <keystore-name>.keystore --ks-key-alias <key-name> -ks-pass <keystore-password> <apk-file>
```
doc : https://developer.android.com/studio/command-line/apksigner.html
