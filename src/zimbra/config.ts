import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "zimbra",
  displayName: "Conversation",
  iconName: "mail",
  hasRight: app => app.name === "Messagerie" || app.name === "Zimbra",
});
