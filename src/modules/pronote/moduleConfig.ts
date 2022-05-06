import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IConnectorState } from './reducers/connector';

export default new NavigableModuleConfig<'pronote', IConnectorState>({
  name: 'pronote',
  entcoreScope: ['pronote'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',

  displayI18n: (entcoreApp, allEntcoreApps, allEntcoreWidgets) => {
    return allEntcoreWidgets.find(w => w.name === 'carnet-de-bord') ? 'CarnetDeBord' : 'Pronote';
  },
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Image', source: require('ASSETS/images/logo-pronote.png') },
});
