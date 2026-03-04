import type reducer from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'carnet-de-bord', ReturnType<typeof reducer>>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  displayI18n: 'pronote',
  entcoreScope: ['pronote', 'sso'],
  hasRight: param =>
    param.matchingWidgets.length > 0 && param.matchingApps.some(entcoreApp => entcoreApp.casType === 'PronoteRegisteredService'),
  matchEntcoreApp: 'Pronote',
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'carnet-de-bord',
  name: 'carnet-de-bord',
  storageName: 'pronote',
});
