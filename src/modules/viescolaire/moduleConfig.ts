import { createModuleConfig } from "../../framework/util/moduleTool";
import { IViesco_State } from "./reducer";

const ViescoApps = ["PRESENCES", "INCIDENTS", "DIARY"];

export default createModuleConfig<"viescolaire", IViesco_State>({
  name: "viescolaire",
  displayName: "viesco",
  //matchEntcoreApp: entcoreApp => entcoreApp.name.toUpperCase() === "PRESENCES",
  matchEntcoreApp: "/viescolaire",
  entcoreScope: ['viescolaire'],
  iconName: "school",
  reducerName: "viesco",
  //hasRight: apps => ViescoApps.every(viescoApp => apps.map(app => app.name.toUpperCase()).includes(viescoApp)),
});
