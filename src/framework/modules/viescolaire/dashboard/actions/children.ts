import { Dispatch } from 'redux';

import {
  competencesDevoirsActionsCreators,
  competencesMoyennesActionsCreators,
} from '~/framework/modules/viescolaire/competences/actions';
import { dataActions as CoursesActions } from '~/framework/modules/viescolaire/dashboard/actions/courses';
import {
  periodsDataActions as periodActions,
  yearDataActions as yearActions,
} from '~/framework/modules/viescolaire/dashboard/actions/periods';
import { dataActions as teacherActions } from '~/framework/modules/viescolaire/dashboard/actions/personnel';
import { dataActions as subjectActions } from '~/framework/modules/viescolaire/dashboard/actions/subjects';
import { selectChildActionType } from '~/framework/modules/viescolaire/dashboard/state/children';
import { diaryHomeworksActionsCreators, diarySessionsActionsCreators } from '~/framework/modules/viescolaire/diary/actions';
import { edtSlotsActionsCreators } from '~/framework/modules/viescolaire/edt/actions';
import { studentEventsActions as historyActions } from '~/modules/viescolaire/presences/actions/events';

// ACTION LIST ------------------------------------------------------------------------------------

export const selectChild = (child: string) => ({ type: selectChildActionType, selectedChild: child });

// THUNKS -----------------------------------------------------------------------------------------

export function selectChildAction(child: string) {
  return async (dispatch: Dispatch, state) => {
    dispatch(diaryHomeworksActionsCreators.clear());
    dispatch(diarySessionsActionsCreators.clear());
    dispatch(teacherActions.clear());
    dispatch(subjectActions.clear());
    dispatch(historyActions.clear());
    dispatch(periodActions.clear());
    dispatch(yearActions.clear());
    dispatch(CoursesActions.clear());
    // EDT
    dispatch(edtSlotsActionsCreators.clear());
    // Competences
    dispatch(competencesDevoirsActionsCreators.clear());
    dispatch(competencesMoyennesActionsCreators.clear());

    dispatch(selectChild(child));
  };
}
