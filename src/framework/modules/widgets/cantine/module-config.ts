import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

import { CantineState } from './reducer';

export default new NavigableModuleConfig<'cantine', CantineState>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  entcoreScope: ['appregistry'],
  entcoreTrackingName: 'Cantine',
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: 'Cantine',
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'cantine-widget',
  name: 'cantine',
  storageName: 'cantine',
});
