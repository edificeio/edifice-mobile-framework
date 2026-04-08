import type { WikiStore } from './store';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'wiki', WikiStore>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayOrder: 0,
  entcoreScope: ['wiki', 'explorer'],
  entcoreTrackingName: 'Wiki',
  fileManager: {
    ressource: {
      allow: ['image'],
      multiple: false,
      sources: ['camera', 'gallery'],
    },
  } as const,
  matchEntcoreApp: 'Wiki',
  name: 'wiki',
  storageName: 'wiki',
});
