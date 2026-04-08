import { ThunkDispatch } from 'redux-thunk';

import { audienceService } from '~/framework/modules/audience/service';
import { AudienceReferer } from '~/framework/modules/audience/types';
import { newsService } from '~/framework/modules/news/service';

/**
 * Get all threads
 */
export const getNewsThreadsAction = () => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  const newsThreads = await newsService.threads.get();
  return newsThreads;
};

/**
 * Get all infos
 */
export const getNewsItemsAction =
  (page: number, threadId?: number, isRefresh?: boolean) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const newsItems = await newsService.infos.get(page, threadId, isRefresh);
    return newsItems;
  };

/**
 * Get all comments for info
 */
export const getNewsItemCommentsAction =
  (newsItemId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    const newsItemComments = await newsService.comments.get(newsItemId);
    return newsItemComments;
  };

/**
 * Get info by id
 */
export const getNewsItemAction = (infoId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  return newsService.info.get(infoId);
};

/**
 * Delete info by id
 */
export const deleteNewsItemAction = (infoId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
  return newsService.info.delete(infoId);
};

/**
 * Delete comment
 */
export const deleteCommentNewsItemAction =
  (infoId: number, commentId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return newsService.comments.delete(infoId, commentId);
  };

/**
 * Publish comment
 */
export const publishCommentNewsItemAction =
  (infoId: number, comment: string) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return newsService.comments.post(infoId, comment);
  };

/**
 * Edit comment
 */
export const editCommentNewsItemAction =
  (infoId: number, comment: string, commentId: number) => async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    return newsService.comments.update(infoId, comment, commentId);
  };

/**
 * Counte Views
 */
export const newsCountViewsAction =
  ({ module, resourceId }: Omit<AudienceReferer, 'resourceType'>) =>
  async () => {
    audienceService.view.post(module, 'info', resourceId).catch(e => console.warn('View post failed', e));

    return audienceService.view.getDetails({
      module,
      resourceId,
      resourceType: 'info',
    });
  };
