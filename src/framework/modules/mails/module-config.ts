import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'mails', null>({
  displayAs: 'tabModule',
  displayColor: theme.apps.conversation.accentColors,
  displayI18n: 'mails-tabname',
  displayOrder: 1,
  displayPicture: { name: 'messagerie-off', type: 'Icon' },
  displayPictureFocus: { name: 'messagerie-on', type: 'Icon' },

  entcoreScope: ['conversation', 'userbook', 'communication'],
  matchEntcoreApp: '/conversation/conversation',
  name: 'mails',
  storageName: 'mails',
  testID: 'tabbar-messages',
  trackingName: 'Mails',
});
