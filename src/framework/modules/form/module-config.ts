import type { IFormReduxState } from './reducer';
import { getFormWorkflowInformation } from './rights';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'form', IFormReduxState>({
  entcoreScope: ['formulaire'],
  entcoreTrackingName: 'Formulaire',
  fileManager: {
    file: {
      allow: ['image', 'video'],
      multiple: true,
      sources: ['camera', 'gallery', 'documents'],
    },
  } as const,
  hasRight: ({ session }) => !!getFormWorkflowInformation(session).initResponse,
  matchEntcoreApp: 'Formulaire',
  name: 'form',
  storageName: 'form',
});
