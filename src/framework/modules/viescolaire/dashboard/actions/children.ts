import { Dispatch } from 'redux';

import { competencesDevoirsActionsCreators } from '~/framework/modules/viescolaire/competences/actions';
import { dataActions as CoursesActions } from '~/framework/modules/viescolaire/dashboard/actions/courses';
import { selectChildActionType } from '~/framework/modules/viescolaire/dashboard/state/children';
import { diaryHomeworksActionsCreators, diarySessionsActionsCreators } from '~/framework/modules/viescolaire/diary/actions';
import { edtSlotsActionsCreators } from '~/framework/modules/viescolaire/edt/actions';

// ACTION LIST ------------------------------------------------------------------------------------

export const selectChild = (child: string) => ({ type: selectChildActionType, selectedChild: child });

// THUNKS -----------------------------------------------------------------------------------------

export function selectChildAction(child: string) {
  return async (dispatch: Dispatch, state) => {
    dispatch(diaryHomeworksActionsCreators.clear());
    dispatch(diarySessionsActionsCreators.clear());
    dispatch(CoursesActions.clear());
    // EDT
    dispatch(edtSlotsActionsCreators.clear());
    // Competences
    dispatch(competencesDevoirsActionsCreators.clear());
    dispatch(selectChild(child));
  };
}
