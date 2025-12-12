import { ScrapbookStore } from './store';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'scrapbook', ScrapbookStore>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.scrapbook.accentColors,
  displayI18n: 'scrapbook-appname',
  displayOrder: 0,
  displayPicture: theme.apps.scrapbook.icon,

  entcoreScope: ['scrapbook'],
  matchEntcoreApp: '/scrapbook',
  name: 'scrapbook',
  storageName: 'scrapbook',
});
