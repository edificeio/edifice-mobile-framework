import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IForm_State } from './reducer';

export default new NavigableModuleConfig<'form', IForm_State>({
  name: 'form',
  entcoreScope: ['formulaire'],
  matchEntcoreApp: '/formulaire',

  displayI18n: 'form.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'form' },
});
