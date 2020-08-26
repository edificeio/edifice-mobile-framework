import { Dispatch } from "redux";
import moment from "moment";
import { declarationActionsTypes } from "../state/declaration";
import { absenceDeclarationService } from "../services/declaration";
import { getSelectedChild, getSelectedChildStructure } from "../../viesco/state/children";
import { Trackers } from "../../../infra/tracker";

export const declarationActions = {
  isPosting: () => ({ type: declarationActionsTypes.isPosting }),
  error: data => ({ type: declarationActionsTypes.error, errmsg: data }),
  posted: () => ({ type: declarationActionsTypes.posted }),
};

export function declareAbsenceAction(startDate: moment.Moment, endDate: moment.Moment, comment: string) {
  return async (dispatch: Dispatch, getState: any) => {
    const state = getState();
    try {
      dispatch(declarationActions.isPosting());
      const data = await absenceDeclarationService.post(
        startDate,
        endDate,
        getSelectedChild(state).id,
        getSelectedChildStructure(state)!.id,
        comment
      );
      dispatch(declarationActions.posted());
      Trackers.trackEvent("viesco", "DECLARE ABSENCE")
    } catch (errmsg) {
      dispatch(declarationActions.error(errmsg));
    }
  };
}
