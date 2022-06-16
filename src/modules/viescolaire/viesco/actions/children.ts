import { Dispatch } from 'redux';

import { dataActions as homeworkActions } from '~/modules/viescolaire/cdt/actions/homeworks';
import { dataActions as sessionActions } from '~/modules/viescolaire/cdt/actions/sessions';
import { dataActions as competencesDevoirsActions } from '~/modules/viescolaire/competences/actions/devoirs';
import { dataActions as competencesMoyennesActions } from '~/modules/viescolaire/competences/actions/moyennes';
import { dataActions as slotsActions } from '~/modules/viescolaire/edt/actions/slots';
import { studentEventsActions as historyActions } from '~/modules/viescolaire/presences/actions/events';
import { dataActions as CoursesActions } from '~/modules/viescolaire/viesco/actions/courses';
import { periodsDataActions as periodActions, yearDataActions as yearActions } from '~/modules/viescolaire/viesco/actions/periods';
import { dataActions as teacherActions } from '~/modules/viescolaire/viesco/actions/personnel';
import { dataActions as subjectActions } from '~/modules/viescolaire/viesco/actions/subjects';
import { selectChildActionType } from '~/modules/viescolaire/viesco/state/children';

// ACTION LIST ------------------------------------------------------------------------------------

export const selectChild = (child: string) => ({ type: selectChildActionType, selectedChild: child });

// THUNKS -----------------------------------------------------------------------------------------

export function selectChildAction(child: string) {
  return async (dispatch: Dispatch, state) => {
    dispatch(homeworkActions.clear());
    dispatch(sessionActions.clear());
    dispatch(teacherActions.clear());
    dispatch(subjectActions.clear());
    dispatch(historyActions.clear());
    dispatch(periodActions.clear());
    dispatch(yearActions.clear());
    dispatch(CoursesActions.clear());
    // EDT
    dispatch(slotsActions.clear());
    // Competences
    dispatch(competencesDevoirsActions.clear());
    dispatch(competencesMoyennesActions.clear());

    dispatch(selectChild(child));
  };
}
