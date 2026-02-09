import type { IFormReduxState } from './reducer';
import { getFormWorkflowInformation } from './rights';

import theme from '~/app/theme';
import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'form', IFormReduxState>({
  displayAs: ModuleType.MYAPPS_MODULE,
  displayColor: theme.apps.formulaire.accentColors,
  displayI18n: 'form-moduleconfig-appname',
  displayPicture: theme.apps.formulaire.icon,
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
  matchEntcoreApp: '/formulaire',
  name: 'form',
  storageName: 'form',
});
