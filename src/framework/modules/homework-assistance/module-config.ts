import type { IHomeworkAssistanceReduxState } from './reducer';
import { getHomeworkAssistanceWorkflowInformation } from './rights';

import theme from '~/app/theme';
import { getSession } from '~/framework/modules/auth/reducer';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homeworkAssistance', IHomeworkAssistanceReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayI18n: 'homeworkassistance-appname',
  displayPicture: { fill: theme.palette.complementary.indigo.regular, name: 'homeworkAssistance', type: 'NamedSvg' },
  entcoreScope: ['homework-assistance'],
  hasRight: () => {
    const session = getSession();
    return !!session && !!getHomeworkAssistanceWorkflowInformation(session).send;
  },

  matchEntcoreApp: '/homework-assistance',
  name: 'homeworkAssistance',
  storageName: 'homeworkAssistance',
});
