import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import type { ISchoolbookState } from './reducer';

export default new NavigableModuleConfig<'schoolbook', ISchoolbookState>({
  name: 'schoolbook',
  entcoreScope: ['schoolbook'],
  matchEntcoreApp: '/schoolbook',
  storageName: 'schoolbook',

  displayI18n: 'schoolbook-moduleconfig-tabname',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'NamedSvg', name: 'homeLiaisonDiary', fill: theme.palette.complementary.green.regular },
});
