import { StackActions, TabActions } from '@react-navigation/native';

import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { myAppsTabRouteName } from '~/framework/modules/myapps/navigation';
import { getModuleTabRouteName } from '~/framework/navigation/tabTarget';

/**
 * Lands on the home of a module, wherever it lives. A module owning a tab is already home once the
 * tab is reached, the others are reached from my apps and have their home pushed there.
 *
 * The home is pushed rather than built under the target screen: a screen born already covered is
 * laid out without its header, and shows its content behind it once revealed.
 */
export const jumpToModuleHome = (moduleName: string, session: AuthActiveAccount, home: string) => {
  const ownTab = getModuleTabRouteName(moduleName, session);
  return ownTab ? [TabActions.jumpTo(ownTab)] : [TabActions.jumpTo(myAppsTabRouteName), StackActions.push(home, {})];
};
