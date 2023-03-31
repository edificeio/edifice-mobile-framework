import theme from '~/app/theme';
import { assertSession } from '~/framework/modules/auth/reducer';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IFormReduxState } from './reducer';
import { getFormWorkflowInformation } from './rights';

export default new NavigableModuleConfig<'form', IFormReduxState>({
  name: 'form',
  entcoreScope: ['formulaire'],
  matchEntcoreApp: '/formulaire',
  hasRight: () => getFormWorkflowInformation(assertSession()).initResponse,

  displayI18n: 'form.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'form', fill: theme.palette.complementary.purple.regular },
});
