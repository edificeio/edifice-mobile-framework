import { AuthLoggedAccount } from '~/framework/modules/auth/model';

export const timelineNotificationReport = 'org.entcore.timeline.controllers.TimelineController|reportNotification';

export const getTimelineWorkflowInformation = (session: AuthLoggedAccount) => {
  return {
    notification: {
      report: session.rights.authorizedActions.some(a => a.name === timelineNotificationReport),
    },
  };
};
