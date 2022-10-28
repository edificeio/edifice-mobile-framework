import moment from 'moment';
import { Dispatch } from 'redux';

import { LocalFile } from '~/framework/util/fileHandler';
import { getUserSession } from '~/framework/util/session';
import { Trackers } from '~/framework/util/tracker';
import { getSelectedChild, getSelectedChildStructure } from '~/modules/viescolaire/dashboard/state/children';
import { absenceDeclarationService } from '~/modules/viescolaire/presences/services/declaration';
import { declarationActionsTypes } from '~/modules/viescolaire/presences/state/declaration';

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
      await absenceDeclarationService.post(
        startDate,
        endDate,
        getSelectedChild(state).id,
        getSelectedChildStructure(state)!.id,
        comment,
      );
      dispatch(declarationActions.posted());
      Trackers.trackEvent('viesco', 'DECLARE ABSENCE');
    } catch (errmsg) {
      dispatch(declarationActions.error(errmsg));
    }
  };
}

export function declareAbsenceWithFileAction(startDate: moment.Moment, endDate: moment.Moment, comment: string, file: LocalFile) {
  return async (dispatch: Dispatch, getState: any) => {
    const state = getState();
    try {
      dispatch(declarationActions.isPosting());
      await absenceDeclarationService.postWithFile(
        startDate,
        endDate,
        getSelectedChild(state).id,
        getSelectedChildStructure(state)!.id,
        comment,
        file,
        getUserSession(),
      );
      dispatch(declarationActions.posted());
      Trackers.trackEvent('viesco', 'DECLARE ABSENCE');
    } catch (errmsg) {
      dispatch(declarationActions.error(errmsg));
    }
  };
}
