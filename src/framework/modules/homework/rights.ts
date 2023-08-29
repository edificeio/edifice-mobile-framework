/**
 * Homework workflow
 */
import { Alert } from 'react-native';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { getStore } from '~/app/store';
import { ISession } from '~/framework/modules/auth/model';
import { navigate } from '~/framework/navigation/helper';
import { resourceHasRight } from '~/framework/util/resourceRights';

import { fetchHomeworkDiaryList } from './actions/diaryList';
import { homeworkRouteNames } from './navigation';
import { IHomeworkDiary } from './reducers/diaryList';
import { registerTimelineWorkflow } from '../timeline/timeline-modules';

export const deleteHomeworkEntryResourceRight = 'fr-wseduc-homeworks-controllers-HomeworksController|deleteEntry';
export const modifyHomeworkEntryResourceRight = 'fr-wseduc-homeworks-controllers-HomeworksController|modifyEntry';

export const viewHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|view';
export const createHomeworkResourceRight = 'fr.wseduc.homeworks.controllers.HomeworksController|createHomework';

export const hasPermissionManager = (homework: IHomeworkDiary, right: string, session: ISession) => {
  return homework && (homework.owner.userId === session.user.id || resourceHasRight(homework, right, session));
};

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
        action: async () => {
          try {
            await (getStore().dispatch as ThunkDispatch<any, any, any>)(fetchHomeworkDiaryList());
            const diaryList = getStore().getState().homework?.diaryList?.data;
            const diaryIdsList = Object.getOwnPropertyNames(diaryList);
            const hasOneDiary = diaryIdsList?.length === 1;
            if (hasOneDiary) {
              navigate(homeworkRouteNames.homeworkCreate);
            } else navigate(homeworkRouteNames.homeworkSelect);
          } catch {
            Alert.alert('', I18n.get('homework-rights-error-text'));
          }
        },
      }
    );
  });
