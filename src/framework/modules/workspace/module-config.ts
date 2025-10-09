import type { IWorkspaceState } from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'workspace', IWorkspaceState>({
  displayAs: 'myAppsModule',
  displayColor: theme.apps.workspace.accentColors,
  displayI18n: 'workspace-moduleconfig-modulename',
  displayPicture: theme.apps.workspace.icon,
  entcoreScope: ['workspace'],

  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('ESPACE DOCUMENTAIRE'),
  name: 'workspace',
  storageName: 'workspace',
});
