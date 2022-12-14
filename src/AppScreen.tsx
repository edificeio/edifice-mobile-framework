import * as React from 'react';

import { RootNavigationContainer } from './navigation/RootNavigator';

export let rootNavigatorRef: any = null;

export default function AppScreen() {
  return <RootNavigationContainer ref={nav => (rootNavigatorRef = nav)} />;
}
