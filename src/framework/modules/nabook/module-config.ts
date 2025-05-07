import { AccountType } from '~/framework/modules/auth/model';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

const AuthorizedAccounts = [AccountType.Relative, AccountType.Student]; // TODO: AccountType.Teacher when needed

export default new NavigableModuleConfig<'nabook', null>({
  displayAs: 'myAppsModule',
  displayI18n: 'nabook-tabname',
  displayPicture: { name: 'nabook', type: 'NamedSvg' },
  entcoreScope: ['nabook'],
  hasRight: ({ matchingApps, session }) => matchingApps.length > 0 && AuthorizedAccounts.includes(session.user.type),
  matchEntcoreApp: '/nabook',
  name: 'nabook',
  storageName: 'nabook',
});
