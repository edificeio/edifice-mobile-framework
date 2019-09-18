import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "lvs",
  displayName: "LVS",
  iconName: "lvs",
  group: true,
  hasRight: (apps) => {
    for(let app of apps) {
      if(app.toUpperCase().includes("LVS")) {
        return true
      }
    }
    return false;
  }
});
