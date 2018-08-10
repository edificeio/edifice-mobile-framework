/**
 * Write here tha app-e functional modules imports.
 * Order has importance, apps will be shown in the same order in the bottom bar.
 */

export default [
  {
    config: require("./homework/config").default,
    module: require("./homework").default
  }
];
