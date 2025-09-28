import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'cantine', null>({
  displayAs: 'myAppsWidgets',
  displayI18n: 'widget-cantine-title',
  displayPicture: { name: 'ui-widget-cantine', type: 'Svg' },
  entcoreScope: ['appregistry'],
  matchEntcoreApp: () => true,
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'cantine-widget',
  name: 'cantine',
  storageName: 'cantine',
});
