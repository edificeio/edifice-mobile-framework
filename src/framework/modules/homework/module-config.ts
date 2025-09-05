import type reducer from './reducers';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  displayAs: 'myAppsModule',
  displayI18n: 'homework',
  displayPicture: { fill: theme.palette.complementary.blue.regular, name: 'homework1D', type: 'Svg' },
  entcoreScope: ['homeworks'],

  matchEntcoreApp: '/homeworks',
  name: 'homework',
  storageName: 'homework',
});
