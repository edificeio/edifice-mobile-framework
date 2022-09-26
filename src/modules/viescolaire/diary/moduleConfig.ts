import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IDiary_State } from './reducer';

export default new NavigableModuleConfig<'diary', IDiary_State>({
  name: 'diary',
  entcoreScope: ['diary'],
  matchEntcoreApp: () => false, // temporary until dashboard redesign

  displayI18n: 'Homework',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'diary' },
});
