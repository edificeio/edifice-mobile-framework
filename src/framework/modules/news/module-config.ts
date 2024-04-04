import theme from '~/app/theme';
import appConf from '~/framework/util/appConf';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { NewsState } from './reducer';

export const fillColor = appConf.is1d ? 'purple' : 'blue';
const fillApp = theme.palette.complementary[fillColor].regular;

export default new NavigableModuleConfig<'news', NewsState>({
  name: 'news',
  entcoreScope: ['actualites'],
  matchEntcoreApp: '/actualites',
  storageName: 'news',

  displayI18n: 'news-moduleconfig-tabname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'newsFeed', fill: fillApp },
});
