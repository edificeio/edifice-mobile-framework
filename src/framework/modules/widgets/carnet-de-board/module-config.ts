import type reducer from './reducer';

import { ModuleType, NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'carnet-de-bord', ReturnType<typeof reducer>>({
  displayAs: ModuleType.MYAPPS_WIDGET,
  displayI18n: 'pronote',
  displayPicture: { source: require('ASSETS/images/logo-pronote.png'), type: 'Image' },
  entcoreScope: ['pronote'],
  hasRight: param => param.matchingWidgets.length > 0,
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'carnet-de-bord',
  name: 'carnet-de-bord',
  storageName: 'pronote',
});
