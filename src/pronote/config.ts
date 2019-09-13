import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "pronote",
  displayName: "Pronote",
  iconName: "pronote",
  group: true,
  hasRight: (apps) => {
    for(let app of apps) {
      if(app.toUpperCase().includes("PRONOTE")) {
        return true
      }
    }
    return false;
  }
});
