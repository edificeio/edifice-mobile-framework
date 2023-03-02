/**
 * Diary selected action(s)
 * Build actions to be dispatched to the diary selected reducer.
 */
import { Action } from 'redux';

import homeworkConfig from '~/framework/modules/homework/module-config';
import { Trackers } from '~/framework/util/tracker';

import { fetchHomeworkTasks } from './tasks';

export const actionTypeDiarySelected = homeworkConfig.namespaceActionType('DIARY_SELECTED');

export interface IActionDiarySelected extends Action {
  diaryId: string;
}

export const createActionDiarySelected: (diaryId: string) => IActionDiarySelected = diaryId => ({
  diaryId,
  type: actionTypeDiarySelected,
});

export function homeworkDiarySelected(diaryId: string) {
  return async dispatch => {
    dispatch(createActionDiarySelected(diaryId));
    dispatch(fetchHomeworkTasks(diaryId));
    Trackers.trackEvent('Homework', 'SELECT');
  };
}

export default homeworkDiarySelected;
