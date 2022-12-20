/**
 * {{moduleName | capitalize}} rights management
 * @scaffolder Remove this file if your module has no workflow rights.
 *
 * The rights manager computes the user rights for your module.
 * It also register workflows in other modules (eg; Timeline) if needed.
 */
import { ISession } from '~/framework/modules/auth/model';

// @scaffolder replace the value by a real workflow right string
export const {{moduleName}}NotificationDoSomething = 'org.entcore.{{moduleName}}.controllers.{{moduleName | capitalize}}Controller|doSomething';

export const getTimelineWorkflowInformation = (session: ISession) => {
  return {
    notification: {
      doSomething: session.authorizedActions.some(a => a.name === {{moduleName}}NotificationDoSomething),
    },
  };
};
