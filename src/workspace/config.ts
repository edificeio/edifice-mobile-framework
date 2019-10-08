import FunctionalModuleConfig from "../infra/moduleTool";
import {NotificationHandlerFactory} from "../infra/pushNotification";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "workspace",
  apiName: "Espace documentaire",
  displayName: "workspace",
  iconName: "folder",
  group: true
});

