import { useFlipper, useReduxDevToolsExtension } from '@react-navigation/devtools';
import { useNavigationContainerRef } from '@react-navigation/native';
import * as React from 'react';

import { RootNavigationContainer } from './navigation/RootNavigator';

export let rootNavigatorRef: any = null;

export default function AppScreen() {
  rootNavigatorRef = useNavigationContainerRef();
  useFlipper(rootNavigatorRef);
  useReduxDevToolsExtension(rootNavigatorRef);
  return <RootNavigationContainer ref={rootNavigatorRef} />;
}
