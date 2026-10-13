import { EntModule } from '~/app/module';
import { AuthActiveAccount } from '~/framework/modules/auth/model';
import { computeTabRouteName, tabModules } from '~/framework/navigation/tabModules';

const isNewTabModule = (moduleName: string, session: AuthActiveAccount) =>
  EntModule.filterTabModules(EntModule.getAvailableForAccount(session)).some(module => module.name === moduleName);

const isOldTabModule = (moduleName: string) => tabModules.get().some(module => module.config.name === moduleName);

// A module has a tab of its own or it has none, and that depends on the structure level. Where a
// module without a tab is reached from is not this question.
export const getModuleTabRouteName = (moduleName: string, session: AuthActiveAccount): string | undefined =>
  isNewTabModule(moduleName, session) || isOldTabModule(moduleName) ? computeTabRouteName(moduleName) : undefined;
