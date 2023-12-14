/**
 * User rights management
 * @scaffolder Remove this file if your module has no workflow rights.
 *
 * The rights manager computes the user rights for your module.
 * It also register workflows in other modules (eg; Timeline) if needed.
 */
import { AuthLoggedAccount } from '~/framework/modules/auth/model';

// export const userNotificationDoSomething = 'org.entcore.user.controllers.UserController|doSomething';

export const getTimelineWorkflowInformation = (session: AuthLoggedAccount) => {
  return {
    // notification: {
    //   doSomething: session.rights.authorizedActions.some(a => a.name === userNotificationDoSomething),
    // },
  };
};
