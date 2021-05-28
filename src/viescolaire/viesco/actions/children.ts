import { Dispatch } from "redux";

import { dataActions as homeworkActions } from "../../cdt/actions/homeworks";
import { dataActions as sessionActions } from "../../cdt/actions/sessions";
import { dataActions as competencesDevoirsActions } from "../../competences/actions/devoirs";
import { dataActions as competencesMoyennesActions } from "../../competences/actions/moyennes";
import { dataActions as servicesMatieresAction } from "../../competences/actions/servicesMatieres";
import { dataActions as structureMatieresAction } from "../../competences/actions/structureMatieres";
import { dataActions as edtCoursesActions } from "../../edt/actions/courses";
import { dataActions as slotsActions } from "../../edt/actions/slots";
import { studentEventsActions as historyActions } from "../../presences/actions/events";
import { periodsDataActions as periodActions, yearDataActions as yearActions } from "../../viesco/actions/periods";
import { dataActions as teacherActions } from "../../viesco/actions/personnel";
import { dataActions as subjectActions } from "../../viesco/actions/subjects";
import { selectChildActionType } from "../state/children";

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
    // EDT
    dispatch(slotsActions.clear());
    dispatch(edtCoursesActions.clear());
    // Competences
    dispatch(competencesDevoirsActions.clear());
    dispatch(competencesMoyennesActions.clear());
    dispatch(servicesMatieresAction.clear());
    dispatch(structureMatieresAction.clear());

    dispatch(selectChild(child));
  };
}
