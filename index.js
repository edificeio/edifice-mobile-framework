import { AppRegistry } from 'react-native';
import { AppStore } from './app/AppStore';

// from https://stackoverflow.com/a/35305611/6111343
// in React Nagite, `proess.nextTick` doesn't exist.
process.nextTick = setImmediate;

AppRegistry.registerComponent('mobileapp', () => AppStore);
