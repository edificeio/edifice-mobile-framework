import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { myAppsModules } from './myAppsModules';

export default new NavigableModuleConfig<'myapps', null>({
  name: 'myapps',
  entcoreScope: [],
  matchEntcoreApp: () => true,
  hasRight: (matchingApps, matchingWidgets) => {
    const modules = myAppsModules.get().filterAvailables(matchingApps);
    return modules.length > 0;
  },
  storageName: 'myapps',

  displayI18n: 'myapp-appname',
  displayAs: 'tabModule',
  displayOrder: 4,
  displayPicture: { type: 'Icon', name: 'icon-apps-off' },
  displayPictureFocus: { type: 'Icon', name: 'icon-apps-on' },
  testID: 'tabbar-apps',
});
