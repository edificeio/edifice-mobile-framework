import type reducer from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'carnet-de-bord', ReturnType<typeof reducer>>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  entcoreScope: ['pronote', 'sso'],
  entcoreWidgetName: 'carnet-de-bord',
  hasRight: param =>
    param.matchingWidgets.length > 0 && param.matchingApps.some(entcoreApp => entcoreApp.casType === 'PronoteRegisteredService'),
  matchEntcoreApp: 'Pronote',
  name: 'carnet-de-bord',
  storageName: 'pronote',
});
