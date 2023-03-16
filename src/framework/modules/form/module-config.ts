import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import reducer from './reducer';

export default new NavigableModuleConfig<'form', typeof reducer>({
  name: 'form',
  entcoreScope: ['formulaire'],
  matchEntcoreApp: '/formulaire',

  displayI18n: 'form.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'form', fill: theme.palette.complementary.purple.regular },
});
