import FunctionalModuleConfig from "../infra/moduleTool";

// tslint:disable:object-literal-sort-keys

export default new FunctionalModuleConfig({
  name: "mailbox",
  apiName: "Messagerie",
  displayName: "Conversation",
  iconName: "conversation",
  notifHandlerFactory: async () => {
    //must lazy load to avoid compile errors
    const res = await import("./notifHandler");
    const val: any = res.default;
    //sometime dynamic import include default in default
    if (val.default) {
      return val.default;
    } else {
      return val;
    }
  },
  hasRight: (apps) => (apps => apps.some(app => app.name == 'Messagerie' || app.name == 'Zimbra'))
});
