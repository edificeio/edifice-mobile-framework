import type { WikiStore } from './store';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'wiki', WikiStore>({
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
