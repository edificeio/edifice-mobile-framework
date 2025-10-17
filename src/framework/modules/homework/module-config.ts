import type reducer from './reducers';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.homeworks.accentColors,
  displayI18n: 'homework',
  displayPicture: theme.apps.homeworks.icon,
  displayPictureBlur: { name: 'diary-outline', type: 'Svg' },
  displayPictureFocus: { name: 'diary-fill', type: 'Svg' },
  entcoreScope: ['homeworks'],

  matchEntcoreApp: '/homeworks',
  name: 'homework',
  storageName: 'homework',
});
