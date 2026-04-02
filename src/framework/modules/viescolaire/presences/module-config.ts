import type { PresencesReduxState } from './reducer';

import { AccountType } from '~/framework/modules/auth/model';
import { getSession } from '~/framework/modules/auth/redux/reducer';
import { IEntcoreApp, ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

function hasNecessaryRight(entcoreApp: IEntcoreApp): boolean {
  const userType = getSession()?.user.type;
  return (
    !!userType &&
    entcoreApp.address === '/presences' &&
    [AccountType.Student, AccountType.Relative, AccountType.Teacher].includes(userType)
  );
}

export default new NavigableModuleConfig<'presences', PresencesReduxState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  entcoreScope: ['presences', 'incidents'],
  entcoreTrackingName: 'Presences',
  fileManager: {
    attachment: {
      allow: ['image', 'document'],
      multiple: false,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  hasRight: ({ matchingApps }) => matchingApps.some(hasNecessaryRight),
  matchEntcoreApp: 'Presences',
  name: 'presences',
  storageName: 'presences',
});
