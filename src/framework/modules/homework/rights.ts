/**
 * Homework workflow
 */
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from '~/app/i18n';
import { getStore } from '~/app/store';
import Toast from '~/framework/components/toast';
import { ISession } from '~/framework/modules/auth/model';
import { registerTimelineWorkflow } from '~/framework/modules/timeline/timeline-modules';
import { navigate } from '~/framework/navigation/helper';
import { resourceHasRight } from '~/framework/util/resourceRights';

import { fetchHomeworkDiaryList } from './actions/diaryList';
import { homeworkDiarySelected } from './actions/selectedDiary';
import { homeworkRouteNames } from './navigation';
import { IHomeworkDiary } from './reducers/diaryList';

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
            const flatDiaryList = diaryIdsList?.map(diaryId => ({
              id: diaryId,
              name: diaryList[diaryId].name,
              title: diaryList[diaryId].title,
              thumbnail: diaryList[diaryId].thumbnail,
              shared: diaryList[diaryId].shared,
              owner: diaryList[diaryId].owner,
            }));
            const diaryListWithCreationRight = flatDiaryList?.filter(diary =>
              hasPermissionManager(diary, modifyHomeworkEntryResourceRight, session),
            );
            const hasOneDiary = diaryListWithCreationRight?.length === 1;

            if (hasOneDiary) {
              (getStore().dispatch as ThunkDispatch<any, any, any>)(homeworkDiarySelected(diaryListWithCreationRight[0].id));
              navigate(homeworkRouteNames.homeworkCreate);
            } else navigate(homeworkRouteNames.homeworkSelect);
          } catch {
            Toast.showError(I18n.get('homework-rights-error-text'));
          }
        },
      }
    );
  });
