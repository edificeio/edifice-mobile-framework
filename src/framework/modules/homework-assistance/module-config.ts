import type { IHomeworkAssistanceReduxState } from './reducer';
import { getHomeworkAssistanceWorkflowInformation } from './rights';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'homeworkAssistance', IHomeworkAssistanceReduxState>({
  displayAs: ModuleType.MYAPPS_SECONDARY_MODULE,
  entcoreScope: ['homework-assistance'],
  entcoreTrackingName: 'HomeworkAssistance',

  hasRight: ({ session }) => !!session && !!getHomeworkAssistanceWorkflowInformation(session).send,
  matchEntcoreApp: '/homework-assistance',
  name: 'homeworkAssistance',
  storageName: 'homeworkAssistance',
});
