import { IFunctionalConfig } from "./infra/moduleTool";
import { Reducer } from "redux";

 /**
  * Write here the app-e functional modules imports.
  * Order has importance, functional modules will be shown in the same order in the bottom bar.
  */
interface IAppModule {
  config: IFunctionalConfig,
  module: {
    reducer: Reducer<any>,
    root: React.ComponentClass<any>,
    route: any
  }
}

export default [
  {
    config: require("./mailbox/config").default,
    module: require("./mailbox").default
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
