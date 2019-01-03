import { AppRegistry } from 'react-native';
import { AppStore } from './app/AppStore';

if (!__DEV__) { console.disableYellowBox = true; }

AppRegistry.registerComponent('mobileapp', () => AppStore);
