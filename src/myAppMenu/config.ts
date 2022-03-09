import { NavigableModuleArray } from '~/framework/util/moduleTool';
import FunctionalModuleConfig from '~/infra/moduleTool';
import { IAppModule } from '~/infra/moduleTool/types';
import { getModules } from '~/navigation/helpers/navBuilder';

import { myAppsModules } from './myAppsModules';

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: 'myapps',
  displayName: 'MyApplications',
  iconName: 'icon-apps',
  hasRight: apps => {
    const filter = (mod: IAppModule) => mod.config.group && mod.config.name !== 'myapps' && mod.config.hasRight(apps);
    const modules = getModules(filter);
    const newModules = new NavigableModuleArray(...myAppsModules.get().filterAvailables(apps));
    const hasModules = modules.length > 0 || newModules.length > 0;
    return hasModules;
  },
});
