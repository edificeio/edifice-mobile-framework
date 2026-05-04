import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import modalScreens from '~/framework/navigation/modals/navigator';

import { RootModule } from '../module';

export function renderRootModulesScreens<NavigationParams extends ParamListBase>(
  RootStack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>,
) {
  return (
    <>
      {RootModule.allRootModules.map(module =>
        module.renderScreens ? (
          <RootStack.Group key={module.name}>
            {module.renderScreens(RootStack as ReturnType<typeof createNativeStackNavigator>)}
          </RootStack.Group>
        ) : null,
      )}
      {modalScreens}
    </>
  );
}
