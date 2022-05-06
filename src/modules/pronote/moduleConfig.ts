import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { IConnectorState } from './reducers/connector';

export default new NavigableModuleConfig<'pronote', IConnectorState>({
  name: 'pronote',
  entcoreScope: ['pronote'],
  matchEntcoreApp: entcoreApp => entcoreApp.casType === 'PronoteRegisteredService',
  matchEntcoreWidget: entcoreWidget => entcoreWidget.name === 'carnet-de-bord',

  displayI18n: (matchingApps, matchingWidgets) => {
    return matchingWidgets.length > 0 ? 'CarnetDeBord' : 'Pronote';
  },
  displayAs: 'myAppsModule',
  displayPicture: { type: 'Image', source: require('ASSETS/images/logo-pronote.png') },
});
