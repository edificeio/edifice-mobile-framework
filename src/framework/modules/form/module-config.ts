import theme from '~/app/theme';
import { getSession } from '~/framework/modules/auth/reducer';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IFormReduxState } from './reducer';
import { getFormWorkflowInformation } from './rights';

export default new NavigableModuleConfig<'form', IFormReduxState>({
  name: 'form',
  entcoreScope: ['formulaire'],
  matchEntcoreApp: '/formulaire',
  hasRight: () => !!getFormWorkflowInformation(getSession()).initResponse,

  displayI18n: 'form-appname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'form', fill: theme.palette.complementary.purple.regular },
});
