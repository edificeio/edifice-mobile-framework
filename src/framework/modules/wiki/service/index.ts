/**
 * API of `wiki`. It takes and gives types of the model (see `adapter.ts`).
 * Every call is signed with the account given (`accountFetch`): the session of the screen.
 */
import type { WikiPage, WikiWithPageNodes } from '~/framework/modules/wiki/model';
import { computeRights } from '~/framework/util/resourceRights';
import { getModuleTransport } from '~/framework/util/transport';
import type { AccountType, AuthActiveAccount } from '~/modules/auth/model';

import {
  getCommentAuthorIds,
  toAccountType,
  toCommentId,
  toEditCommentBody,
  toPostCommentBody,
  toWikiPage,
  toWikiWithPageNodes,
} from './adapter';
import type { API } from './types';

// Typed with the scopes of the module (`getModuleTransport`): `/wiki/...`, `/userbook/...`
const { accountFetch } = getModuleTransport('wiki');

/** The account type of each user: the API of the comments doesn't give it. One request per user. */
const getAccountTypes = async (session: AuthActiveAccount, userIds: string[]): Promise<Record<string, AccountType | undefined>> =>
  Object.fromEntries(
    await Promise.all(
      userIds.map(async userId => {
        const data = await accountFetch.json<API.Userbook.PersonResponse>(session, `/userbook/api/person?id=${userId}`);
        return [userId, toAccountType(data)] as const;
      }),
    ),
  );

export const wikiService = {
  page: {
    /** Deletes a comment of a page. */
    deleteComment: async (session: AuthActiveAccount, wikiId: string, pageId: string, commentId: string) => {
      await accountFetch.json<API.Wiki.PostCommentResponse>(session, `/wiki/${wikiId}/page/${pageId}/comment/${commentId}`, {
        method: 'DELETE',
      });
    },
    /** Changes a comment of a page. */
    editComment: async (session: AuthActiveAccount, wikiId: string, pageId: string, commentId: string, comment: string) => {
      await accountFetch.json<API.Wiki.PostCommentResponse>(session, `/wiki/${wikiId}/page/${pageId}/comment/${commentId}`, {
        body: JSON.stringify(toEditCommentBody(comment)),
        method: 'PUT',
      });
    },
    /** A page of a wiki, with its comments. */
    get: async (session: AuthActiveAccount, wikiId: string, pageId: string): Promise<WikiPage> => {
      const data = await accountFetch.json<API.Wiki.GetPageResponse>(session, `/wiki/${wikiId}/page/${pageId}`);
      return toWikiPage(data, await getAccountTypes(session, getCommentAuthorIds(data.comments)));
    },
    /**
     * Posts a comment on a page, or a reply to a comment.
     * @returns the id of the comment.
     */
    postComment: async (session: AuthActiveAccount, wikiId: string, pageId: string, comment: string, replyTo?: string) => {
      const data = await accountFetch.json<API.Wiki.PostCommentResponse>(session, `/wiki/${wikiId}/page/${pageId}/comment`, {
        body: JSON.stringify(toPostCommentBody(comment, replyTo)),
        method: 'POST',
      });
      return toCommentId(data);
    },
  },
  wiki: {
    /** A wiki, with the rights of the user on it, and its pages as the server sends them (`arrangeWikiPages` orders them). */
    get: async (session: AuthActiveAccount, wikiId: string): Promise<WikiWithPageNodes> => {
      const data = await accountFetch.json<API.Wiki.ListPagesResponse>(session, `/wiki/${wikiId}`);
      return toWikiWithPageNodes(data, computeRights(data, session));
    },
  },
};
