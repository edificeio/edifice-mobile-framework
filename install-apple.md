# App.e : ODE Mobile Plateform - Setup for macOS → iOS

## Setup environment

Build an iOS application requires a Mac computer.

### Xcode

Install **Xcode**, the main IDE for macOS to build apps for all Apple's plateforms, providing simulators for every Apple device, from the AppStore. *Tested version : 9.4 (9F1027a)*

To build from command-line, you will need to install **Command Line Tools**. It's easy as open a Terminal and run `gcc`. A popup will prompt you to install Command Line Tools. Check if the installation worked by running `gcc --version`.

### Node.js

The **Node.js** javascript runtime is needed to use [React Native](https://facebook.github.io/react-native/). Several ways exist to install Node.js (choose one) :
- Get it from [the official site](https://nodejs.org/en/download/)
- [Homebrew](https://brew.sh/index_fr) and run `brew install node` (or use [Another package manager](https://nodejs.org/en/download/package-manager/#macos)).
- (recommended) Grab it with [Node Version Manager](https://github.com/creationix/nvm). You can get NVM from Homebrew by running `brew install nvm`. To use it you have to create a `.bashrc` file in your home folder and put this in :
    ```
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
    ```
    Then, you can run `source ~/.bashrc` in a terminal to use NVM commands.
    Install Node.js with :
    ```
    nvm install 10.2.1
    nvm use 10.2.1
    ```
*Tested version of Node.js : v10.2.1*

### Watchman

**[Watchman](https://facebook.github.io/watchman/)** is requiered by React Native to build your project when file changes.

Get it by running `brew install watchman`.

### Git clone
```
git clone http://<YOUR TETRAGRAPH>@code.web-education.net/ODE/mobile-app.git

cd mobile-app
```
Note : `YOUR TETRAGRAPH` is your 4-letter identifier within Open Digital Education.

### Node modules installation
Node modules are javascript dependencies used in the javascript part of the project (which uses React Native). They are configured in `package.json` and `package-lock.json`. To install them, just run :
```
npm install -g react-native-cli

npm install
```

### Cocoa Pods
While node modules are used in React Native code, some other dependencies are requiered for the iOS native code. Here comes **[Cocoa Pods](https://cocoapods.org/)**, another dependency manager for Swift and Objective-C. Install the Pods by running :
```
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
```
react-native link react-native-firebase
```

### Build project
```
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
```
npm install -g react-native-git-upgrade

react-native-git-update
```
