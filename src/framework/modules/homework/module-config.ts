import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import reducer from './reducers';

export const moduleColor = theme.palette.complementary[appConf.is1d ? 'blue' : 'green'];

export default new NavigableModuleConfig<'homework', ReturnType<typeof reducer>>({
  name: 'homework',
  entcoreScope: ['homeworks'],
  matchEntcoreApp: '/homeworks',

  displayI18n: 'homework',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'homework1D', fill: moduleColor.regular },
});
