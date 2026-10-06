import { StackActions, TabActions } from '@react-navigation/native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import moduleConfig from '~/framework/modules/homework/module-config';
import { homeworkRouteNames } from '~/framework/modules/homework/navigation';
import { getModuleTabRouteName } from '~/framework/navigation/tabTarget';

// The second action puts the home of the module under the target, so the back button leads to it.
// The selected diary is read from the store, which is why the parameters are empty.
export const goToHomeworkTasks = (session: AuthActiveAccount) => [
  TabActions.jumpTo(getModuleTabRouteName(moduleConfig.name, session), {
    initial: false,
    screen: homeworkRouteNames.home,
  }),
  StackActions.push(homeworkRouteNames.homeworkTaskList, {}),
];
