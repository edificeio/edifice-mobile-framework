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

# Building customized environnement

A cli tool "ode-plugin" is available to help you customized your application by overriding assets or choose the right config files according to the context.

## Override

This application could be customize during the build process. The following elements could be overriden:
- BundleID and App Name
  - Android: android/gradle.properties [APPID,APPNAME]
  - iOS: Info.plist [APPID,APPNAME]
- Launcher Icon
  - Android: override the following files android/src/main/res/*/ic_launcher
  - iOS: override the following files ios/mobileapp/Images.xcassets/AppIcon.appiconset/*
- Launcher Image
  - Android: override the following files android/src/main/res/drawable/*
  - iOS: override the following files ios/mobileapp/Images.xcassets/LaunchImage.launchimage/*
- Assets:
  - override image at assets/images/*
  - override icons at assets/icons/*
  - any other assets at assets/*

### Create a new override

**ode-plugin** make it easy to create a new override. Just type the command below and answer the questions:

```
$ node ode-plugin.js override create
✔ What is the name of this override? … my_override_name
✔ What is the application's ID for this override? … com.my.application
✔ What is the application's name for this override? … My App
✔ What is the ID of the config? … my dev config
✔ Switch to the new override my_override_name Y/n? … n
```
Just tell the plugin:
- the name of the override (to identify it)
- the application's Id (or bundle id use to identify the app in stores). Genrally a fully qualified name.
- the application's name: the display name of the app in stores
- the config's ID: we will see below how to define config

And finally the plugin suggest to switch the current project to the new override.
When you switch to an override, all assets updates should not be tracked by git. 
We will see later how to save override changes.

### Switch to an override

When you switch to a new override, you apply all changes defined in the override:
- override assets (react, android, ios)
- override app id and app name (android, ios, package.json)
- optionnally you can load the config associated to the override (maybe your overriden app have a different firebase config file?)

To switch to an override just type:

```
$ node ode-plugin.js override switch --to=test
Restoring files before switching...
There are no files to restore
Restoring package.json and native appids...
Files are going to be replaced from overrides:
   overrides/test/assets/images/no-avatar.png
✔ Do you confirm the replacement of theses files Y/n? … y
✔ Do you want to restore the config Y/n? … y
✔ What is the repo's URL? … http://test.git  
✔ What is the repo's username? … XXXXX
✔ What is the repo's password? … ***
Config files restored successfully
```
When you switch to an override, you just have to specify the id of this override (test in this example).

The plugin first restore your project before applying override changes.
Before making any changes, the plugin all files that are going to be replaced and aks whether it should make replacement.

When it has finished to apply override, it asks if it should also fetch the config associated to the override.

> You can skip restore using --dontrestore

> You can skip confirmation using --acceptall

>  You can set git credentials (to avoid prompts) using parameters: --uri --username --password

### Backup changes

If you have overriden some assets, you can save save changes for this override using the following command:

```
$ node ode-plugin.js override backup
You are going to backup uncommited/unstaged files below:
M assets/images/no-avatar.png
U overrides/test/assets/images/no-avatar.1.png
✔ Do you confirm to backup theses files in the override test Y/n? … y
Files backed up successfully
The files below seems to not exists anymore:
   overrides/test/assets/images/no-avatar.1.png
✔ Do you want to remove them from override test Y/n? … y
Files removed from ovveride successfully
✔ Do you want to unapplied the current oveeride Y/n? … n
```
The plugin will check (using git) all changed files and will ask if it should backup them.

It will also detect any overriden files that has been reverted and suggest to remove it from backup.

And finally the plugin ask whether you would like to unapply override.

All overriden assets will be backed up the **override** folder at the root of the project.

### Unapply override

To unapply an override use the command below:

```
$ node ode-plugin.js override restore
You are going to reset uncommited/unstaged files below:
M assets/images/no-avatar.png
✔ Do you confirm to reset theses files Y/n? … y
Restoring package.json and native appids...
✔ Do you want to restore the config Y/n? … y
✔ What is the repo's URL? … http://test.git  
✔ What is the repo's username? … XXX
✔ What is the repo's password? … ***
Config files restored successfully
```

The plugin will list all overriden assets that need to be restored and will ask whether it should reset files.

Then it will reset app ids and bundle name (ios,android, package.json).

And finally it will ask whether he should restore the default config (defined in package.json).


### See current override

To see which override is currently apply, use the command below:

```
$ node ode-plugin.js override
There are no overrides applied!
```

### Configure the plugin

To configure the plugin just add an "ode" bloc in *package.json* as follow:

```
"ode": {
    "appid": "com.ode.appe",//default bundle id
    "appname": "app-e-dev",//default bundle name
    "properties": {//which file need to be update when bundle id/name is overriden
      "ios": "ios/mobileapp/Info.plist",
      "android": "android/gradle.properties"
    },
    "overrides": [//list of folders that could be overriden
      "assets/*",
      "android/app/src/main/res/*",
      "mobileapp/Images.xcassets/*"
    ],
    "config": {
      ...//see belows how it works
    }
  }
```

## Configuration

Config files are not tracked by GIT (they are ignored). They also could change according to the environnement. Below some examples of confidential config files:
- Platform Config File: override app/Conf.ts
- Firebase config files:
  - Android: android/app/config.json
  - iOS: ios/mobileapp/config.plist

Config files are defined in package.json as follow:

```
"ode": {
   ...
    "config": {
      "id": "neo-recette",//default config applied
      "url": "http://test.git  ",//(optionnal) default git repository where the plugin will fetch configs
      //mappings between config files in repository and the current project
      "config.android.json": "android/app/config.json",
      "config.ios.plist": "ios/mobileapp/config.plist",
      "Conf.ts": "app/Conf.ts"
    }
  }
```

> Config files MUST be ignored by git

### Where are configs

Config are stored in secured git repository.
The folder structure should be as follow:
```
my_env1
  config_file1
  config_file2
  config_file3
my_env2
  config_file1
  config_file2
  config_file3
...
```
The folder is used by the plugin as *config ID*.

So in your *package.json* when you have
```
"ode": {
   ...
    "config": {
      "id": "my_env1",//default config applied
    }
  }
```
It will load config in "my_env1" folder.

Then you define in your *package.json* a mapping between config files and project files as follow:

```
"ode": {
   ...
    "config": {
      ...
      //mappings between config files in repository and the current project
      "config_file1": "android/myfile",
      "config_file2": "ios/myfile",
      "config_file3": "app/myfile"
    }
  }
```


### Fetch config

You can load the project from the repository using the command below;
```
$ node ode-plugin.js fetch-config
✔ What is the repo's URL? … http://test.git
✔ What is the repo's username? … nman
✔ What is the repo's password? … ***
Config files restored successfully
```

The plugin will automatically load the config attach to your current override (or your default config if no override is applied).

> you can specify options to avoid prompts: --uri --username --password