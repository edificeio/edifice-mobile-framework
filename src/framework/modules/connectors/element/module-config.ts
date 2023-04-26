import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'element', null>({
  name: 'element',
  entcoreScope: ['cas'],
  matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase().includes('RIOT'),

  displayI18n: 'element.tabName',
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Image', source: require('ASSETS/images/logo-riot.png') },
});
