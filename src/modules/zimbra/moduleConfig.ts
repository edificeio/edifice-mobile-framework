import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IZimbra_State } from './reducer';

const isXmasThemeOn = true;
export default new NavigableModuleConfig<'zimbra', IZimbra_State>({
  name: 'zimbra',
  entcoreScope: ['zimbra'],
  matchEntcoreApp: '/zimbra/zimbra',

  displayI18n: 'Conversation',
  displayAs: 'tabModule',
  displayOrder: 1,
  displayPicture: { type: 'Icon', name: `${isXmasThemeOn ? 'xmas-' : ''}messagerie-off` },
  displayPictureFocus: { type: 'Icon', name: `${isXmasThemeOn ? 'xmas-' : ''}messagerie-on` },
});
