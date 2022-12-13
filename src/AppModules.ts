import type { IAppModule } from './infra/moduleTool/types';

/**
 * Write here the app-e functional modules imports.
 * Order has importance, functional modules will be shown in the same order in the bottom bar.
 */

const modules = [
  // Now all modules are included here at runtime with regiterModule()
  /*{
    order: 0,
    config: require("./mailbox/config").default,
    module: require("./mailbox").default
  },*/
  /*{
    order: 1,
    config: require("./pronote/config").default,
    module: require("./pronote").default
  },*/
  /*{
    order: 2,
    config: require("./lvs/config").default,
    module: require("./lvs").default
  },*/
  /*{
    order: 3,
    config: require("./myAppMenu/config").default,
    module: require("./myAppMenu").default
  },*/
  /*{
    order: 4,
    config: require("./homework/config").default,
    module: require("./homework").default
  },
  {
    config: require("./viescolaire/config").default,
    module: require("./viescolaire").default
  },
  {
    order: 5,
    config: require("./user/config").default,
    module: require("./user").default
  },*/
  /*{
    order: 6,
    config: require("./workspace/config").default,
    module: require("./workspace").default
  },{
    config: require("./zimbra/config").default,
    module: require("./zimbra").default
  },*/
] as IAppModule[];

export default modules;

export const registerModule = (module: IAppModule) => {
  modules.push(module);
};
