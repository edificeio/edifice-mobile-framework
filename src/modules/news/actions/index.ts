/**
 * News actions
 */

import { ThunkDispatch } from 'redux-thunk';

import { getUserSession } from '~/framework/util/session';
import moduleConfig from '~/modules/news/moduleConfig';
import { newsService } from '~/modules/news/service';

/**
 * Fetch the details of a given news item.
 */
export const getNewsDetailsAction =
  (newsId: { threadId: string; infoId: string }) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    try {
      const session = getUserSession(getState());

      // Get news details
      const newsDetails = await newsService.get(session, newsId);
      return newsDetails;
    } catch (e) {
      // ToDo: Error handling
      console.warn(`[${moduleConfig.name}] getNewsDetailsAction failed`, e);
    }
  };
