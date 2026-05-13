import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'screenTime', null>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  entcoreScope: ['appregistry'],
  entcoreWidgetName: 'screen-time-widget',
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: 'Screentime',
  name: 'screenTime',
  storageName: 'screenTime',
});
