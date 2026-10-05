import React from 'react';

import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useModuleTabNavigation } from './tabs';
import { useModuleModals } from '../module/hooks';

const useModulesNavigation = () => {
  // Check static navigation is only created once.
  const isMounted = React.useRef(false);
  if (isMounted.current) {
    console.error(`[Navigation] Static navigation was re-rendered and this should not happen. 'modules' array object has changed.`);
  }
  React.useEffect(() => {
    isMounted.current = true;
  }, []);

  // Create static navigation upon modules
  const modals = useModuleModals();
  const tabs = useModuleTabNavigation();
  const Navigation = React.useMemo(
    () =>
      createStaticNavigation(
        createNativeStackNavigator({
          screens: { ...modals, $tabs: tabs },
          // screens: { ...modals },
        }),
      ),
    [modals, tabs],
  );
  return Navigation;
};

export const RootNavigation = React.memo(function () {
  const Navigation = useModulesNavigation();
  return <Navigation />;
});
RootNavigation.displayName = 'RootNavigation';
