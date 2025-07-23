import type { IZimbraReduxState } from './reducer';

import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'zimbra', IZimbraReduxState>({
  displayAs: 'tabModule',
  displayColor: theme.apps.zimbra.accentColors,
  displayI18n: 'zimbra-moduleconfig-tabname',
  displayOrder: 1,
  displayPicture: { name: 'messagerie-off', type: 'Icon' },
  displayPictureFocus: { name: 'messagerie-on', type: 'Icon' },
  entcoreScope: ['zimbra'],
  matchEntcoreApp: '/zimbra/zimbra',
  name: 'zimbra',
  storageName: 'zimbra',
  testID: 'tabbar-zimbra',
});
