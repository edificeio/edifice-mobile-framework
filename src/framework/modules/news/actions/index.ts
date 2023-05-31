/**
 * News actions
 */
import { ThunkDispatch } from 'redux-thunk';

import { assertSession } from '~/framework/modules/auth/reducer';
import { newsService } from '~/framework/modules/news/service';

/**
 * Fetch the details of a given news item.
 */
export const getNewsDetailsAction =
  (newsId: { threadId: string; infoId: string }) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = assertSession();

      // Get news details
      const newsDetails = await newsService.get(session, newsId);
      return newsDetails;
    } catch {
      // ToDo: Error handling
    }
  };
