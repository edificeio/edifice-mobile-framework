import { ISession } from '../auth/model';

export const timelineNotificationReport = 'org.entcore.timeline.controllers.TimelineController|reportNotification';

export const getTimelineWorkflowInformation = (session: ISession) => {
  return {
    notification: {
      report: session.authorizedActions.some(a => a.name === timelineNotificationReport),
    },
  };
};
