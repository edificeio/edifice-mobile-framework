/**
 * Schoolbook actions
 */
import { ThunkDispatch } from 'redux-thunk';

import { getUserSession } from '~/framework/util/session';
import moduleConfig from '~/modules/schoolbook/moduleConfig';
import { ISchoolbookWordReport, getUnacknowledgedChildrenIdsForParent } from '~/modules/schoolbook/reducer';
import { schoolbookService } from '~/modules/schoolbook/service';

/**
 * Fetch the details of a given schoolbook word.
 */
export const getSchoolbookWordDetailsAction =
  (schoolbookWordId: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = getUserSession();

      // Get schoolbook word
      const schoolbookWordDetails = await schoolbookService.word.get(session, schoolbookWordId);
      return schoolbookWordDetails;
    } catch (e) {
      // ToDo: Error handling
    }
  };

/**
 * Acknowledge children for a given schoolbook word.
 */
export const acknowledgeSchoolbookWordActionForChildren =
  (schoolbookWordId: string, unacknowledgedChildrenIds: string[]) =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = getUserSession();

      // Acknowledge word for each child
      const acknowledgements = unacknowledgedChildrenIds.map(unacknowledgedChildId =>
        schoolbookService.word.acknowledge(session, schoolbookWordId, unacknowledgedChildId),
      );
      await Promise.all(acknowledgements);
    } catch (e) {
      // ToDo: Error handling
    }
  };

/**
 * Acknowledge children for a given schoolbook word.
 */
export const acknowledgeSchoolbookWordAction =
  (schoolbookWordData: ISchoolbookWordReport) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = getUserSession();

      const unacknowledgedChildrenIds =
        schoolbookWordData && getUnacknowledgedChildrenIdsForParent(session.user.id, schoolbookWordData);
      return await dispatch(
        acknowledgeSchoolbookWordActionForChildren(schoolbookWordData.word.id.toString(), unacknowledgedChildrenIds),
      );
    } catch (e) {
      // ToDo: Error handling
    }
  };
