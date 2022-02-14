import { ISchoolbook_State } from './reducer';

import { createNavigableModuleConfig } from '~/framework/util/moduleTool';

export default createNavigableModuleConfig<'schoolbook', ISchoolbook_State>({
  name: 'schoolbook',
  displayName: 'schoolbook.tabName',
  matchEntcoreApp: '/schoolbook',
  entcoreScope: ['schoolbook'],
});
