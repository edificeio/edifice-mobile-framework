import type reducer from './reducer';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'pronote', ReturnType<typeof reducer>>({
  displayAs: (matchingApps, matchingWidgets) => (matchingWidgets.length > 0 ? 'myAppsSecondaryModule' : 'myAppsConnector'),
  displayI18n: (matchingApps, matchingWidgets) => {
    return matchingWidgets.length > 0 ? 'carnetdebord' : 'pronote';
  },
  displayPicture: { source: require('ASSETS/images/logo-pronote.png'), type: 'Image' },
  entcoreScope: ['pronote'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',

  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'carnet-de-bord',
  name: 'pronote',
  storageName: 'pronote',
});
