import theme from '~/app/theme';
import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'mails', null>({
  displayAs: 'myAppsModule',
  displayI18n: 'mails-tabname',
  displayPicture: { fill: theme.palette.complementary.green.regular, name: 'messagerie-off', type: 'Icon' },

  entcoreScope: ['conversation', 'userbook'],
  matchEntcoreApp: '/conversation/conversation',
  name: 'mails',
  storageName: 'mails',
  testID: 'tabbar-messages',
  trackingName: 'Mails',
});
