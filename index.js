import { AppRegistry } from 'react-native';

// Add URLSearchParams polyfill as it is not implemented in React Native.
// @see https://github.com/facebook/react-native/issues/23922#issuecomment-648096619
import 'react-native-url-polyfill/auto';

import { name as appName } from './app.json';
import App from './src/app/index';
import { Log } from './src/app/log';

import './wdyr';

// from https://stackoverflow.com/a/35305611/6111343
// in React Native, `process.nextTick` doesn't exist.
process.nextTick = setImmediate;

if (__DEV__) {
  globalThis.RNFBDebug = true;
  require('./src/app/reactotron.ts');
  console.debug('Reactotron initialized');
}

Log.init();

AppRegistry.registerComponent(appName, () => App);
