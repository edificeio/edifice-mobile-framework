This project was bootstrapped with [Create React Native App](https://github.com/react-community/create-react-native-app).

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

### For upgrading react-native

Install `react-native-git-upgrade`

Execute

`react-native-git-upgrade 0.52`

to update to 0.49.3

## Build vector icon

Les icones vectoriels (svg) seront mis dans une font au format truetype (ttf).

Les icones doivent respecter certaines conditions pour etre transformé en police truetype par l'oitil icomoon: https://icomoon.io/app/#/select

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

### Link

Le resultat des procedures de link ont ete archivé, donc pas besoin de le refaire

## Tests

```bash
npm test
```

## Lancement debug

Pour la reprise à chaud

```bash
npm start
```

Compilation typescrypt

```bash
npm tsc
```

Ouvrir une autre session pour lancement emulateur

```bash
npm run android
```

ou

```bash
npm run ios
```

## Generation clef Android

```bash
npm run private-key
```

### Generation APK (Android)

la commande

```bash
npm run apk
```

## Clean

```
npm run miniclean
```

# Know issues

* react-native-vector-icons and react-native 0.52 on Android

```
Error: While trying to resolve module `react-native-vector-icons` from file `mobile-app/build/components/ui/icons/Icon.js`, the package `/mobile-app/node_modules/react-native/local-cli/core/__fixtures__/files/package.json` was successfully found.
```

Quick fix:
[react-native-vector-icons#626](https://github.com/oblador/react-native-vector-icons/issues/626)

# Firebase configuration

## Analytics

* Analytics tag are sended by batch so you will not seem them instantly in the firebase console.
  You need to activate the debug view:

  [Enable debug View](https://support.google.com/firebase/answer/7201382?hl=en)

Follow this steps:

* Android
  To enable Analytics Debug mode on an emulated Android device, execute the following command lines:

`adb shell setprop debug.firebase.analytics.app com.mobileapp`

This behavior persists until you explicitly disable Debug mode by executing the following command line :

`adb shell setprop debug.firebase.analytics.app .none.`

* iOS
  To enable Analytics Debug mode on your development device, specify the following command line argument in Xcode :

`-FIRDebugEnabled`

This behavior persists until you explicitly disable Debug mode by specifying the following command line argument:

`--FIRDebugDisabled`
