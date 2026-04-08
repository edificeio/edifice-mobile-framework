import type { ISchoolbookState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'schoolbook', ISchoolbookState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  entcoreScope: ['schoolbook'],

  entcoreTrackingName: 'SchoolBook',
  matchEntcoreApp: 'Schoolbook',
  name: 'schoolbook',
  storageName: 'schoolbook',
});
