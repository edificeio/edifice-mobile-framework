import { CantineState } from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

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
