import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IEdt_State } from './reducer';

export default new NavigableModuleConfig<'edt', IEdt_State>({
  name: 'edt',
  entcoreScope: ['edt'],
  matchEntcoreApp: '/edt', // temporary until dashboard redesign

  displayI18n: 'viesco-timetable',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'edt' },
});
