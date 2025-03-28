import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'nabook', null>({
  displayAs: 'myAppsModule',
  displayI18n: 'nabook-tabname',
  displayPicture: { fill: theme.palette.complementary.orange.regular, name: 'ui-tool', type: 'NamedSvg' },
  entcoreScope: ['nabook'],
  matchEntcoreApp: '/nabook',
  name: 'nabook',
  storageName: 'nabook',
});
