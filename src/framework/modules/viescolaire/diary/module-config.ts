import type { IDiaryReduxState } from './reducer';

import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
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
  displayColor: theme.apps.diary.accentColors,
  displayI18n: 'diary-moduleconfig-appname',
  displayPicture: theme.apps.diary.icon,
  entcoreScope: ['diary'],

  entcoreTrackingName: 'Diary',
  hasRight: ({ matchingApps }) => matchingApps.some(hasNecessaryRight),
  matchEntcoreApp: 'Diary',
  name: 'diary',
  storageName: 'diary',
});
