import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';
import { getUserSession } from '~/framework/util/session';

import { IHomeworkAssistance_State } from './reducer';
import { getHomeworkAssistanceWorkflowInformation } from './rights';

const hasSendRight = () => {
  const session = getUserSession();
  return getHomeworkAssistanceWorkflowInformation(session).send;
};

export default new NavigableModuleConfig<'homeworkAssistance', IHomeworkAssistance_State>({
  name: 'homeworkAssistance',
  entcoreScope: ['homework-assistance'],
  matchEntcoreApp: '/homework-assistance',
  hasRight: () => hasSendRight(),

  displayI18n: 'homeworkAssistance.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'homeworkAssistance', fill: theme.palette.complementary.indigo.regular },
});
