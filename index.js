/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// from https://stackoverflow.com/a/35305611/6111343
// in React Native, `proess.nextTick` doesn't exist.
process.nextTick = setImmediate;

AppRegistry.registerComponent(appName, () => App);
