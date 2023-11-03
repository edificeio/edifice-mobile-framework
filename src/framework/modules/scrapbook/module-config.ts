import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'scrapbook', null>({
  name: 'scrapbook',
  entcoreScope: ['scrapbook'],
  matchEntcoreApp: '/scrapbook',
  displayI18n: 'scrapbook-appname',
  displayAs: 'myAppsModule',
  displayOrder: 0,
  displayPicture: { type: 'NamedSvg', name: 'scrapbook', fill: theme.palette.complementary.green.regular },
});
