import type { IFormReduxState } from './reducer';
import { getFormWorkflowInformation } from './rights';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'form', IFormReduxState>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.formulaire.accentColors,
  displayI18n: 'form-moduleconfig-appname',
  displayPicture: theme.apps.formulaire.icon,
  entcoreScope: ['formulaire'],
  hasRight: ({ session }) => !!getFormWorkflowInformation(session).initResponse,

  matchEntcoreApp: '/formulaire',
  name: 'form',
  storageName: 'form',
});
