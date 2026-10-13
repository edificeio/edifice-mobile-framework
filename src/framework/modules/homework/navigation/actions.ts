import { StackActions } from '@react-navigation/native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/homework/module-config';
import { homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { jumpToModuleHome } from '~/framework/modules/myapps/navigation/actions';

// The home of the module is reached first, so the back button leads to it. The selected diary is
// read from the store, which is why the parameters are empty.
export const goToHomeworkTasksAction = (session: AuthActiveAccount) => [
  ...jumpToModuleHome(moduleConfig.name, session, homeworkRouteNames.home),
  StackActions.push(homeworkRouteNames.homeworkTaskList, {}),
];
