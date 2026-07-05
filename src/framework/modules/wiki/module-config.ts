import type { AudienceReferer } from '~/framework/modules/audience/types';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { WikiStore } from './store';

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

export const wikiAudienceConfig: Pick<AudienceReferer, 'module' | 'resourceType'> = { module: 'wiki', resourceType: 'page' };
