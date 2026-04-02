import type { IDiaryReduxState } from './reducer';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/diary' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'diary', IDiaryReduxState>({
  displayAs: ModuleType.MYAPPS_SECONDARY_MODULE,
  entcoreScope: ['diary'],

  entcoreTrackingName: 'Diary',
  hasRight: ({ matchingApps }) => matchingApps.some(hasNecessaryRight),
  matchEntcoreApp: 'Diary',
  name: 'diary',
  storageName: 'diary',
});
