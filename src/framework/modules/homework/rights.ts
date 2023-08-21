/**
 * Homework workflow
 */
import { I18n } from '~/app/i18n';
import { ISession } from '~/framework/modules/auth/model';
import { navigate } from '~/framework/navigation/helper';

import { homeworkRouteNames } from './navigation';
import { registerTimelineWorkflow } from '../timeline/timeline-modules';

export const viewHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|view';
export const createHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|createHomework';

export const getHomeworkWorkflowInformation = (session: ISession) => ({
  view: session.authorizedActions.some(a => a.name === viewHomeworkResourceRight),
  create: session.authorizedActions.some(a => a.name === createHomeworkResourceRight),
});

export default () =>
  registerTimelineWorkflow(session => {
    const wk = getHomeworkWorkflowInformation(session);
    return (
      wk.create && {
        title: I18n.get('homework-resourcename'),
        action: () => {
          navigate(homeworkRouteNames.home);
        },
      }
    );
  });
