import theme from '~/app/theme';
import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { IEdtReduxState } from './reducer';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/edt' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'edt', IEdtReduxState>({
  name: 'edt',
  entcoreScope: ['edt'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),
  storageName: 'edt',

  displayI18n: 'edt-moduleconfig-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'edt', fill: theme.palette.complementary.indigo.regular },
});
