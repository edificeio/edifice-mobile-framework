import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IHomeworkAssistance_State } from './reducer';

export default new NavigableModuleConfig<'homeworkAssistance', IHomeworkAssistance_State>({
  name: 'homeworkAssistance',
  entcoreScope: ['homework-assistance'],
  matchEntcoreApp: '/homework-assistance',

  displayI18n: 'homeworkAssistance.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'homeworkAssistance', fill: theme.palette.complementary.indigo.regular },
});
