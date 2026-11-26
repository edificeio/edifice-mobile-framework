/**
 * What the user does in `wiki`: open a wiki or a page, comment a page. Each action goes through the service, then puts the result in
 * the store (`store/`, which only holds the Redux state, actions and selectors). They receive the session: the screen has it
 * (`withSession`).
 */
import type { ThunkAction } from 'redux-thunk';

import type { Wiki, WikiPage } from '~/framework/modules/wiki/model';
import { arrangeWikiPages } from '~/framework/modules/wiki/model/pages';
import { wikiService } from '~/framework/modules/wiki/service';
import { WikiAction, wikiActions, WikiRootState } from '~/framework/modules/wiki/store';
import type { AuthActiveAccount } from '~/modules/auth/model';

type WikiThunk<Result> = ThunkAction<Promise<Result>, WikiRootState, unknown, WikiAction>;

/** Loads a wiki, with its pages as the user sees them (`arrangeWikiPages`). */
export const loadWiki =
  (session: AuthActiveAccount, wikiId: Wiki['assetId']): WikiThunk<Wiki> =>
  async dispatch => {
    const { pages, ...data } = await wikiService.wiki.get(session, wikiId);
    const wiki: Wiki = { ...data, pages: arrangeWikiPages(pages, data.rights) };
    dispatch(wikiActions.wikiLoaded(wiki));
    return wiki;
  };

/** Loads a page of a wiki, with its comments. */
export const loadWikiPage =
  (session: AuthActiveAccount, wikiId: Wiki['assetId'], pageId: WikiPage['id']): WikiThunk<WikiPage> =>
  async dispatch => {
    const page = await wikiService.page.get(session, wikiId, pageId);
    dispatch(wikiActions.pageLoaded(page));
    return page;
  };

/**
 * Posts a comment on a page, or a reply to a comment, then loads the page again.
 * @returns the id of the comment.
 */
export const postWikiPageComment =
  (
    session: AuthActiveAccount,
    wikiId: Wiki['assetId'],
    pageId: WikiPage['id'],
    comment: string,
    replyTo?: string,
  ): WikiThunk<string> =>
  async dispatch => {
    const commentId = await wikiService.page.postComment(session, wikiId, pageId, comment, replyTo);
    await dispatch(loadWikiPage(session, wikiId, pageId));
    return commentId;
  };

/** Changes a comment of a page, then loads the page again. */
export const editWikiPageComment =
  (
    session: AuthActiveAccount,
    wikiId: Wiki['assetId'],
    pageId: WikiPage['id'],
    commentId: string,
    comment: string,
  ): WikiThunk<void> =>
  async dispatch => {
    await wikiService.page.editComment(session, wikiId, pageId, commentId, comment);
    await dispatch(loadWikiPage(session, wikiId, pageId));
  };

/** Deletes a comment of a page, then loads the page again. */
export const deleteWikiPageComment =
  (session: AuthActiveAccount, wikiId: Wiki['assetId'], pageId: WikiPage['id'], commentId: string): WikiThunk<void> =>
  async dispatch => {
    await wikiService.page.deleteComment(session, wikiId, pageId, commentId);
    await dispatch(loadWikiPage(session, wikiId, pageId));
  };
