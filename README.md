# Linux - Build
## Dev Setup

#Installation

## react-native

* Suivre le guide https://facebook.github.io/react-native/docs/getting-started.html

* Selectionner l'onglet "Building Projects with native code"

\*\* Attention : Pour l'installation d'Android Studio, ne pas installer de machine virtuelle, cela ne sert à rien (en tous cas sous Linux)

# Releases Guide

This document serves as guide for release building

## Release configuration

React Native follows a monthly release train. Every month, a new branch created off master enters the Release Candidate phase, and the previous Release Candidate branch is released and considered stable.

| Version | RC release | Stable release | Node version | Yarn version | React native |
| ------- | ---------- | -------------- | ------------ | ------------ | ------------ |
|         |            |                | / / /        |

---

## Modification répertoire Android

* Utilisation de Proguard pour la génération

Fichier modifié:

```bash
./android/app/build.gradle
```

Contient aussi le paramètre de proguard (voir generation apk à la suite du document)

## Prerequisites

### Install react-native

`npm install -g react-native-cli`

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

## Install

```bash
npm install
```

* Un bug dans react-native oblige à supprimer le fichier package.json situé sous
  `node_modules/react-native/local-cli/core/__fixtures__/files`
* react-native-vector-icons and react-native 0.52 on Android

```
Error: While trying to resolve module `react-native-vector-icons` from file `mobile-app/build/components/ui/icons/Icon.js`, the package `/mobile-app/node_modules/react-native/local-cli/core/__fixtures__/files/package.json` was successfully found.
```

Quick fix:
[react-native-vector-icons#626](https://github.com/oblador/react-native-vector-icons/issues/626)

### Link

Le resultat des procedures de link ont ete archivé, donc pas besoin de le refaire

## Tests

```bash
npm test
```

- Clone the project

```
<<<<<<< HEAD

Compilation typescrypt

```bash
npm tsc
=======
git clone <repository>
>>>>>>> c1d6958... Init dev branch
```

- In project folder, launch :

```
npm install
```

<<<<<<< HEAD
## Generation clef Android

```bash
npm run private-key
```

### Generation APK (Android)

la commande
=======
---

## Development

Launch these two commands in separate shels.

   - Launch the development server
   
```
npm start
```
>>>>>>> c1d6958... Init dev branch

   - Launch ts compilation and watcher
   
```
npm run tsc
```

<<<<<<< HEAD
## Clean
=======
After these commands, you can modify the code.
#### Testing

- Android : Run the apk, on a connected Android (device or emulator), in debug mode.
>>>>>>> c1d6958... Init dev branch

To do if you have build or deployment problem

```
<<<<<<< HEAD
npm run clean
```

### For upgrading react-native

Install `react-native-git-upgrade`

Execute

`react-native-git-upgrade 0.52`
=======
npm run android
```

-  iOS : 

   *--TODO--*
>>>>>>> c1d6958... Init dev branch

---
## Android : build APK

<<<<<<< HEAD
## Generate Font

Ouvrir le site https://icomoon.io/app/#/select

* Prendre l'ensemble des icones SVG de l'application et les droper ds Icomoon
* Selectionner l'ensemble des icones dans Icomoon
* Generer le fichier de font
* Extraire du fichier le fichier json et ttf pour les mettre dans le repertoire assets/font

# Firebase configuration

## Analytics

* Analytics tag are sended by batch so you will not seem them instantly in the firebase console.
  You need to activate the debug view:

  [Enable debug View](https://support.google.com/firebase/answer/7201382?hl=en)

Follow this steps:

* Android
  To enable Analytics Debug mode on an emulated Android device, execute the following command lines:

`adb shell setprop debug.firebase.analytics.app com.ode.appe`

This behavior persists until you explicitly disable Debug mode by executing the following command line :

`adb shell setprop debug.firebase.analytics.app .none.`

* iOS
  To enable Analytics Debug mode on your development device, specify the following command line argument in Xcode :

`-FIRDebugEnabled`

This behavior persists until you explicitly disable Debug mode by specifying the following command line argument:

`--FIRDebugDisabled`
=======
The APK must be signed with a key, so that it can be run on an Android device. cf : https://developer.android.com/studio/publish/app-signing.html

**Important : The application must use the same key.**

####  With Android Studio (for debug apk)

Android Studio signs the APK with debug. Don't use it for release versions.

- Import the android folder as android project
-  You can build and run it as normal android prject

#### Command line (for release apk)

##### Build a new APK

In <repository> folder, launch :
```
npm run apk
```
the apk file will be generated in android/app/build/outputs/apk/

##### Create a Keystore (if the Keystore file does not exist)
```
keytool -genkeypair -v -keystore <keystore-name>.keystore -alias <key-name> -keyalg RSA -keysize 2048 -validity 10000
```
doc : https://docs.oracle.com/javase/8/docs/technotes/tools/unix/keytool.html
##### Zipalign the APK - archive alignment - (optional)
```
zipalign 4 <apk-file>
```
doc : https://developer.android.com/studio/command-line/zipalign.html

##### Sign the APK

apksigner is in $ANDROID_HOME/build-tools
```
apksigner sign --ks <keystore-name>.keystore --ks-key-alias <key-name> -ks-pass <keystore-password> <apk-file>
```
doc : https://developer.android.com/studio/command-line/apksigner.html

## iOS : IPA

*--TODO--*
>>>>>>> c1d6958... Init dev branch
