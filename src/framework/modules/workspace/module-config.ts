import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IWorkspaceState } from './reducer';

export default new NavigableModuleConfig<'workspace', IWorkspaceState>({
  name: 'workspace',
  entcoreScope: ['workspace'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('ESPACE DOCUMENTAIRE'),

  displayI18n: 'workspace.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'files', fill: theme.palette.complementary.red.regular },
});
