import { IAppModule } from "./infra/moduleTool";


/**
 * Write here the app-e functional modules imports.
 * Order has importance, functional modules will be shown in the same order in the bottom bar.
 */

export default [
  {
    config: require("./mailbox/config").default,
    module: require("./mailbox").default
  },
  {
    config: require("./pronote/config").default,
    module: require("./pronote").default
  },
  {
    config: require("./lvs/config").default,
    module: require("./lvs").default
  },
  {
    config: require("./myAppMenu/config").default,
    module: require("./myAppMenu").default
  },
  {
    config: require("./homework/config").default,
    module: require("./homework").default
  },
  {
    config: require("./user/config").default,
    module: require("./user").default
  }
] as IAppModule[];
