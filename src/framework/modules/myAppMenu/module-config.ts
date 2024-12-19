import { myAppsModules } from './myAppsModules';

import { NavigableModuleConfig } from '~/framework/util/moduleTool';

export default new NavigableModuleConfig<'myapps', null>({
  displayAs: 'tabModule',
  displayI18n: 'myapp-appname',
  displayOrder: 4,
  displayPicture: { name: 'icon-apps-off', type: 'Icon' },
  displayPictureFocus: { name: 'icon-apps-on', type: 'Icon' },

  entcoreScope: [],
  hasRight: ({ session }) => {
    const modules = myAppsModules.get().filterAvailables(session);
    return modules.length > 0;
  },
  matchEntcoreApp: () => true,
  name: 'myapps',
  storageName: 'myapps',
  testID: 'tabbar-apps',
});
