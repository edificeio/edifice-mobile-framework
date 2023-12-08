import theme from '~/app/theme';
import { getSession } from '~/framework/modules/auth/reducer';
import { IEntcoreApp, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IEdtReduxState } from './reducer';
import { AccountTyoe } from '../../auth/model';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/edt' &&
    [AccountTyoe.Student, AccountTyoe.Relative, AccountTyoe.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'edt', IEdtReduxState>({
  name: 'edt',
  entcoreScope: ['edt'],
  matchEntcoreApp: entcoreApp => hasNecessaryRight(entcoreApp),

  displayI18n: 'edt-moduleconfig-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'edt', fill: theme.palette.complementary.indigo.regular },
});
