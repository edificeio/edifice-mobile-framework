# App.e : ODE Mobile Plateform - Setup for macOS → iOS

## Setup environment

Build an iOS application requires a Mac computer.

### Xcode

Install **Xcode**, the main IDE for macOS to build apps for all Apple's plateforms, providing simulators for every Apple device, from the AppStore. *Tested version : 9.4 (9F1027a)*

### Homebrew

Get **Homebrew** [from the officiel website](https://brew.sh/index_fr) and install it.

Homebrew will try to install a Xcode module named **Command Line Tools**. Check if this module is present by running `xcode-select -p`.

### Node.js

The **Node.js** javascript runtime is needed to use [React Native](https://facebook.github.io/react-native/). Several ways exist to install Node.js (choose one) :
- Get it from [the official site](https://nodejs.org/en/download/)
- From Homebrew by simply runnning `brew install node` (or use [Another package manager](https://nodejs.org/en/download/package-manager/#macos)).
- (recommended) Grab it with [Node Version Manager](https://github.com/creationix/nvm). You can get NVM from Homebrew by running `brew install nvm`. To use it you have to follow these instructions: [(got from here)](http://dev.topheman.com/install-nvm-with-homebrew-to-use-multiple-versions-of-node-and-iojs-easily/)
    ```bash
    # Run this:
    mkdir ~/.nvm
    nano ~/.bash_profile

    # In the Nano editor, put these lines:
    export NVM_DIR=~/.nvm
    source $(brew --prefix nvm)/nvm.sh

    # Then save and exit Nano, and run this:
    source ~/.bash_profile

    # Check activation with: (Should print "nvm")
    command -v nvm

    # Install and activate the right Node.js version: (see the right version to use below)
    nvm install <WANTED_VERSION>
    nvm use stable

    # (Optional) Check installed Node.js version with:
    nvm current
    ```

*Tested version of Node.js : 10.2.1*

### Watchman

**[Watchman](https://facebook.github.io/watchman/)** is requiered by React Native to build your project when file changes.

Get it by running `brew install watchman`.

### Git clone
```bash
git clone http://<YOUR TETRAGRAPH>@code.web-education.net/ODE/mobile-app.git

cd mobile-app
# Don't forget to checkout the right branch !
```
Note : `YOUR TETRAGRAPH` is your 4-letter identifier within Open Digital Education.

### Node modules installation
Node modules are javascript dependencies used in the javascript part of the project (which uses React Native). They are configured in `package.json` and `package-lock.json`. To install them, just run :
```bash
npm install -g react-native-cli

npm install
```

### Cocoa Pods
While node modules are used in React Native code, some other dependencies are requiered for the iOS native code. Here comes **[Cocoa Pods](https://cocoapods.org/)**, another dependency manager for Swift and Objective-C. Install the Pods by running :
```bash
# Install Cocoa Pods on your computer (just once) :
sudo gem install cocoapods

# Install Cocoa Pods dependencies for this project :
cd ios

pod update
pod install

cd ..
```

### Link React Native Firebase
React Native has some dependencies which contains native code for mobile devices, like **[React Native Firebase](https://github.com/invertase/react-native-firebase)**. It need to be linked to the iOS project by running :
```bash
react-native link react-native-firebase
```

### Build project
```bash
# Build javascript part
npm run tsc:build

# Build & run native part
react-native run-ios
```
You can also build from Xcode, but beware of open the `ios/mobileapp.xcworkspace` workspace file, NOT a `*.xcodeproj` file.

## Troubleshooting

The macOS - iOS environment can be vrey tricky sometimes. Report to this Q&A chapter to try to fix your problems.
If you can't find a solution, please contact [Rafik Djedjig](mailto:rafik.djedjig@opendigitaleducation.com) or [Valentin Mourot](mailto:valentin.mourot@opendigitaleducation.com).

### App updates aren't visible on the built app on the emulator

Try to reset your emulator cache in the menu **Hardware → Erase All Content and Settings**. This will reboot your emulator and reinstall your app from scratch next time you will run the app with `react-native run-ios`.

### Config.h not found
It seems to be an error from the node module `glog`.
In a terminal, go to the folder `node_modules/react-native/third-party/glog-0.3.4/` (or same with a different version number), and run `./configure`.

### How to upgrade React Native safely ?
```bash
npm install -g react-native-git-upgrade

react-native-git-update
```

### Have some build error when run `npm run ios` with RCT<SOME_MODULE_NAME> not found ?
It may be because of parallel building. Open `ios/mobileapp.xcworkspace` in Xcode.
Take care of having `mobileapp` as the selected project (with the white "e" icon in a blue square).
Go to `Menu Product → Scheme → Manage schemes...`, then select the scheme `mobileapp` and edit it.
Go in the "Build" tab at the left pane, and uncheck the "Parallelize Build" box, and click on the little `+`at the bottom left to add a target, search "React", and add it. Be sure to have it at the top of the list, otherwise drag it to the top.