import { NavigableModuleConfig } from '~/framework/util/moduleTool';

import { myAppsModules } from './myAppsModules';

export default new NavigableModuleConfig<'myapps', null>({
  name: 'myapps',
  entcoreScope: [],
  matchEntcoreApp: (entcoreApp, allEntcoreApps) => {
    const modules = myAppsModules.get().filterAvailables(allEntcoreApps);
    return modules.length > 0;
  },

  displayI18n: 'MyApplications',
  displayAs: 'tabModule',
  displayOrder: 4,
  displayPicture: { type: 'Icon', name: 'icon-apps-off' },
  displayPictureFocus: { type: 'Icon', name: 'icon-apps-on' },
});
