import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<string, null>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.nabook.accentColors,
  displayI18n: 'nabook-tabname',
  displayPicture: theme.apps.nabook.icon,
  entcoreScope: ['nabook'],
  matchEntcoreApp: '/nabook',
  name: 'nabook',
  storageName: 'nabook',
});
