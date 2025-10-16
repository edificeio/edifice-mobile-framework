import type { ISchoolbookState } from './reducer';

import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'schoolbook', ISchoolbookState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayColor: theme.apps.schoolbook.accentColors,
  displayI18n: 'schoolbook-moduleconfig-tabname',
  displayPicture: theme.apps.schoolbook.icon,
  entcoreScope: ['schoolbook'],

  matchEntcoreApp: '/schoolbook',
  name: 'schoolbook',
  storageName: 'schoolbook',
});
