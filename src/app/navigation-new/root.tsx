import React from 'react';
import { Text, View } from 'react-native';

import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useModules, useModuleScreens } from '../module/loader';
import type { AllModulesNavigationParams } from '../module/types';

// export function renderCoreModulesScreens<NavigationParams extends ParamListBase>(
//   RootStack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>,
// ) {
//   const modules = useModules();

//   return (
//     <>
//       {Modules.getAllOfType(CoreModule).map(module =>
//         module.renderScreens ? (
//           <RootStack.Group key={module.name}>
//             {module.renderScreens(RootStack as ReturnType<typeof createNativeStackNavigator>)}
//           </RootStack.Group>
//         ) : null,
//       )}
//       {modalScreens}
//     </>
//   );
// }

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
  const screens = useModuleScreens();
  const Navigation = React.useMemo(
    () =>
      createStaticNavigation(
        createNativeStackNavigator<AllModulesNavigationParams>({
          screens,
        }),
      ),
    [screens],
  );
  return Navigation;
};

export const RootNavigation = React.memo(function () {
  const Navigation = useModulesNavigation();
  return <Navigation />;
});
RootNavigation.displayName = 'RootNavigation';
