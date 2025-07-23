import type { IHomeworkAssistanceReduxState } from './reducer';
import { getHomeworkAssistanceWorkflowInformation } from './rights';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homeworkAssistance', IHomeworkAssistanceReduxState>({
  displayAs: 'myAppsSecondaryModule',
  displayColor: theme.apps['homework-assistance'].accentColors,
  displayI18n: 'homeworkassistance-appname',
  displayPicture: theme.apps['homework-assistance'].icon,
  entcoreScope: ['homework-assistance'],
  hasRight: ({ session }) => !!session && !!getHomeworkAssistanceWorkflowInformation(session).send,

  matchEntcoreApp: '/homework-assistance',
  name: 'homeworkAssistance',
  storageName: 'homeworkAssistance',
});
