/**
 * Write here the app-e functional modules imports.
 * Order has importance, functional modules will be shown in the same order in the bottom bar.
 */

export default [
  {
    config: require("./homework/config").default,
    module: require("./homework").default
  },
  {
    config: require("./user/config").default,
    module: require("./user").default
  }
];
