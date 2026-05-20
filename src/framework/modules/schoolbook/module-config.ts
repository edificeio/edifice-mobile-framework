import type { ISchoolbookState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'schoolbook', ISchoolbookState>({
  entcoreScope: ['schoolbook'],

  entcoreTrackingName: 'SchoolBook',
  matchEntcoreApp: 'Schoolbook',
  name: 'schoolbook',
  storageName: 'schoolbook',
});
