import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { CantineState } from './reducer';

export default new NavigableModuleConfig<'cantine', CantineState>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  entcoreScope: ['appregistry'],
  entcoreTrackingName: 'Cantine',
  entcoreWidgetName: 'cantine-widget',
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: 'Cantine',
  name: 'cantine',
  storageName: 'cantine',
});
