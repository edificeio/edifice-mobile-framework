import { ISession } from '~/framework/modules/auth/model';

export const timelineNotificationReport = 'org.entcore.timeline.controllers.TimelineController|reportNotification';

export const getTimelineWorkflowInformation = (session: ISession) => {
  return {
    notification: {
      report: session.authorizedActions.some(a => a.name === timelineNotificationReport),
    },
  };
};
