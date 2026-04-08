import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'screenTime', null>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  entcoreScope: ['appregistry'],
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: 'Screentime',
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'screen-time-widget',
  name: 'screenTime',
  storageName: 'screenTime',
});
