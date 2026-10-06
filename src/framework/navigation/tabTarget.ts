import { EntModule } from '~/app/module';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import myAppsModuleConfig from '~/framework/modules/myapps/module-config';
import { computeTabRouteName, tabModules } from '~/framework/navigation/tabModules';

const isNewTabModule = (moduleName: string, session: AuthActiveAccount) =>
  EntModule.filterTabModules(EntModule.getAvailableForAccount(session)).some(module => module.name === moduleName);

const isOldTabModule = (moduleName: string, session: AuthActiveAccount) =>
  tabModules
    .get()
    .filterAvailables(session)
    .some(module => module.config.name === moduleName);

// there are some module that can be tab modules depending on the structure level.
export const getModuleTabRouteName = (moduleName: string, session: AuthActiveAccount) =>
  computeTabRouteName(
    isNewTabModule(moduleName, session) || isOldTabModule(moduleName, session) ? moduleName : myAppsModuleConfig.name,
  );
