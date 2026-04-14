import type reducer from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'support', ReturnType<typeof reducer>>({
  entcoreScope: ['support'],
  entcoreTrackingName: 'Support',
  fileManager: {
    attachments: {
      allow: ['image', 'video', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  matchEntcoreApp: 'Aide et support',
  name: 'support',
  storageName: 'support',
});
