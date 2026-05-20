import type { IEdtReduxState } from './reducer';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/edt' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'edt', IEdtReduxState>({
  entcoreScope: ['edt'],

  entcoreTrackingName: 'Edt',
  hasRight: ({ matchingApps }) => matchingApps.some(hasNecessaryRight),
  matchEntcoreApp: 'Edt',
  name: 'edt',
  storageName: 'edt',
});
