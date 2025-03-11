import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'mails', null>({
  displayAs: 'myAppsModule',
  displayI18n: 'mails-tabname',
  displayPicture: { name: 'messagerie-off', type: 'Icon' },

  entcoreScope: ['conversation', 'userbook', 'communication'],
  matchEntcoreApp: '/conversation/conversation',
  name: 'mails',
  storageName: 'mails',
  testID: 'tabbar-messages',
  trackingName: 'Mails',
});
