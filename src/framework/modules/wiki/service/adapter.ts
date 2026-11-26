/**
 * Translation of the API of `wiki` to the model (and of the model to the bodies sent). No rule here: the pages of a wiki are given as
 * the server sends them, unordered (`arrangeWikiPages` of the model orders them).
 */
import { Temporal } from '@js-temporal/polyfill';

import type * as CommentsThread from '~/framework/modules/comments/types';
import type { WikiPage, WikiWithPageNodes } from '~/framework/modules/wiki/model';
import { AccountType } from '~/modules/auth/model';

import type { API } from './types';

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;

/**
 * The wiki, with its pages as the server sends them.
 * @param rights the rights of the user on the wiki (`computeRights`).
 */
export const toWikiWithPageNodes = (data: API.Wiki.ListPagesResponse, rights: string[]): WikiWithPageNodes => ({
  assetId: data._id, // Explorer.assetId = Wiki.id. Explorer.id is something else that does not depend on the application.
  createdAt: Temporal.Instant.from((data.created ?? data.modified).$date),
  creatorId: data.owner.userId,
  creatorName: data.owner.displayName,
  description: data.description,
  name: data.title,
  pages: data.pages.map(page => ({
    childrenIds: [...(page.children ?? [])].sort(byPosition).map(child => child._id),
    id: page._id,
    isVisible: page.isVisible,
    parentId: page.parentId ?? undefined,
    position: page.position,
    title: page.title,
  })),
  rights,
  thumbnail: data.thumbnail,
  updatedAt: Temporal.Instant.from(data.modified.$date),
});

/** The authors of the comments of a page, whose account type the API doesn't give. */
export const getCommentAuthorIds = (comments: API.Wiki.GetPageResponse['comments'] = []): string[] => [
  ...new Set(comments.flatMap(item => ('author' in item ? [item.author] : []))),
];

/** Account types as `/userbook/api/person` gives them. */
const accountTypesFromPerson = {
  External: AccountType.External,
  Guest: AccountType.Guest,
  Personnel: AccountType.Personnel,
  Relative: AccountType.Relative,
  Student: AccountType.Student,
  Teacher: AccountType.Teacher,
} as const;

/** The account type of a user, from `/userbook/api/person` (`undefined` if the user is not found). */
export const toAccountType = (data: API.Userbook.PersonResponse): AccountType | undefined =>
  accountTypesFromPerson[data.result[0]?.type[0]] ?? undefined;

/** A comment or a reply, deleted or not, before the replies are put under their comment. */
type CommentOrReply = Omit<CommentsThread.CommentItem, 'replies'> | Omit<CommentsThread.CommentDeletedItem, 'replies'>;

/**
 * The comments of a page as a thread: the comments, the newest first, each with its replies, the oldest first.
 * @param accountTypes the account type of each author (`getCommentAuthorIds`); a guest if it is unknown.
 */
const toComments = (
  data: API.Wiki.GetPageResponse['comments'] = [],
  accountTypes: Record<string, AccountType | undefined>,
): CommentsThread.AnyCommentItem[] => {
  const comments: Record<CommentsThread.AnyCommentItem['id'], CommentOrReply> = {};
  const replies: Record<CommentsThread.AnyCommentItem['id'], CommentsThread.AnyReplyItem[]> = {};

  for (const item of data) {
    const common = { date: Temporal.Instant.from(item.created.$date), id: item._id };
    // The server gives no author for a deleted comment, which the types of `comments` require all the same (later.md)
    const parsed = (
      'deleted' in item
        ? { ...common, deleted: true }
        : {
            ...common,
            authorAccountType: accountTypes[item.author] ?? AccountType.Guest, // a guest if the user is not found
            authorId: item.author,
            authorName: item.authorName,
            content: item.comment,
            isRichContent: false,
          }
    ) as CommentOrReply;
    if ('replyTo' in item) {
      if (!(item.replyTo in replies)) replies[item.replyTo] = [];
      replies[item.replyTo].push(parsed);
    } else {
      comments[parsed.id] = parsed;
    }
  }

  return Object.values(comments)
    .sort((a, b) => Temporal.Instant.compare(b.date, a.date))
    .map(
      comment =>
        ({
          ...comment,
          replies: (replies[comment.id] ?? []).sort((a, b) => Temporal.Instant.compare(a.date, b.date)),
        }) as CommentsThread.AnyCommentItem,
    );
};

/**
 * A page of a wiki, with its comments.
 * @param accountTypes the account type of each author of a comment (`getCommentAuthorIds`).
 */
export const toWikiPage = (data: API.Wiki.GetPageResponse, accountTypes: Record<string, AccountType | undefined>): WikiPage => ({
  comments: toComments(data.comments, accountTypes),
  content: data.content,
  contentVersion: data.contentVersion,
  createdAt: Temporal.Instant.from((data.created ?? data.modified).$date),
  creatorId: data.author,
  creatorName: data.authorName,
  id: data._id,
  isVisible: data.isVisible,
  title: data.title,
  updatedAt: data.modified ? Temporal.Instant.from(data.modified.$date) : undefined,
  updaterId: data.lastContributer,
  updaterName: data.lastContributerName,
});

/** The body that posts a comment, or a reply to a comment. */
export const toPostCommentBody = (comment: string, replyTo?: string) => ({ comment, replyTo });

/** The body that changes a comment. */
export const toEditCommentBody = (comment: string) => ({ comment });

/** The id of a comment just posted. */
export const toCommentId = (data: API.Wiki.PostCommentResponse) => data._id;
