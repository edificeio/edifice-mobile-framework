import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IZimbraReduxState } from './reducer';

export default new NavigableModuleConfig<'zimbra', IZimbraReduxState>({
  name: 'zimbra',
  entcoreScope: ['zimbra'],
  matchEntcoreApp: '/zimbra/zimbra',

  displayI18n: 'zimbra-moduleconfig-tabname',
  displayAs: 'tabModule',
  displayOrder: 1,
  displayPicture: { type: 'Icon', name: 'messagerie-off' },
  displayPictureFocus: { type: 'Icon', name: 'messagerie-on' },
});
