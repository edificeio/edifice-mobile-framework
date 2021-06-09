import { createNavigableModuleConfig } from "../../framework/util/moduleTool";
import { IConnectorState } from "./reducers/connector";

const regexp = /la[- ]+vie[- ]+scolaire/i;

function hasConnectorModule(entcoreApp) {
  const isModule =
    entcoreApp.address && (entcoreApp.address.toUpperCase().includes("LVS") || regexp.test(entcoreApp.address));
  if (isModule && isModule !== -1) return true;
  return false;
}

export default createNavigableModuleConfig<"lvs", IConnectorState>({
  name: "lvs",
  displayName: "LVS",
  matchEntcoreApp: entcoreApp => hasConnectorModule(entcoreApp),
  entcoreScope: ['lvs'],
  iconName: "lvs",
  //group: true,
});
