import type { IWorkspaceState } from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'workspace', IWorkspaceState>({
  entcoreScope: ['workspace'],
  entcoreTrackingName: 'Workspace',
  fileManager: {
    upload: {
      allow: ['image', 'video', 'document'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  hasRight: ({ matchingApps }) => matchingApps.some(entcoreApp => entcoreApp.name.toUpperCase().includes('ESPACE DOCUMENTAIRE')),
  matchEntcoreApp: 'Espace documentaire',
  name: 'workspace',
  storageName: 'workspace',
});
