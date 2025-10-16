import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'scrapbook', null>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayColor: theme.apps.scrapbook.accentColors,
  displayI18n: 'scrapbook-appname',
  displayOrder: 0,
  displayPicture: theme.apps.scrapbook.icon,

  entcoreScope: ['scrapbook'],
  matchEntcoreApp: '/scrapbook',
  name: 'scrapbook',
  storageName: 'scrapbook',
});
