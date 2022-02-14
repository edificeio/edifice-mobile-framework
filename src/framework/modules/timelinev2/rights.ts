import { IUserSession } from '~/framework/util/session';

export const timelineNotificationReport = 'org.entcore.timeline.controllers.TimelineController|reportNotification';

export const getTimelineWorkflowInformation = (session: IUserSession) => ({
  notification: {
    report: session.user.authorizedActions.some(a => a.name === timelineNotificationReport),
  },
});
