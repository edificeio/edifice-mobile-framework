import { ScrapbookStore } from './store';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'scrapbook', ScrapbookStore>({
  displayOrder: 0,

  entcoreScope: ['scrapbook'],
  entcoreTrackingName: 'Scrapbook',
  matchEntcoreApp: 'Cahier Multimédia',
  name: 'scrapbook',
  storageName: 'scrapbook',
});
