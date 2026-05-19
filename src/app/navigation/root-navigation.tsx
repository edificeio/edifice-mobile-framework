import { ParamListBase } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import modalScreens from '~/framework/navigation/modals/navigator';

import { CoreModule } from '../module';
import { Modules } from '../module/all';

export function renderCoreModulesScreens<NavigationParams extends ParamListBase>(
  RootStack: ReturnType<typeof createNativeStackNavigator<NavigationParams>>,
) {
  return (
    <>
      {Modules.getAllOfType(CoreModule).map(module =>
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
