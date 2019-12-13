import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "lvs",
  displayName: "LVS",
  iconName: "lvs",
  group: true,
  hasRight: (apps) => {
    const regexp = /la[- ]+vie[- ]+scolaire/i
    for(let app of apps) {
      if(app.address && app.address.toUpperCase().includes("LVS") || regexp.test(app.address)) {
        return true
      }
    }
    return false;
  }
});
