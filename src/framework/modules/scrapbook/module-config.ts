import { ScrapbookStore } from './store';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'scrapbook', ScrapbookStore>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayOrder: 0,

  entcoreScope: ['scrapbook'],
  entcoreTrackingName: 'Scrapbook',
  matchEntcoreApp: 'Cahier Multimédia',
  name: 'scrapbook',
  storageName: 'scrapbook',
});
