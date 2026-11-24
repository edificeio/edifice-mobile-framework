/**
 * Rules of `blog`: what the user can do on a blog and its posts (rights of the resource, workflow rights of the session), the blogs
 * where he can publish, the comments of a post. What they need of the session is given to them.
 */
import { Temporal } from '@js-temporal/polyfill';

import type { AnyCommentItem, AnyReplyItem } from '~/framework/modules/comments/types';
import { computeRights, resourceHasRight, resourceRightFilter } from '~/framework/util/resourceRights';
import { AccountType, type AuthActiveAccount } from '~/modules/auth/model';

import type { Blog, BlogList, BlogPost, BlogPostComment, BlogPostComments, BlogPostCommentsThread } from '.';

// Rights of a blog on its posts (sharing of the blog, `resourceHasRight`)
export const createBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|create';
export const submitBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|submit';
export const publishBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|publish';
export const commentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|comment';
export const updateCommentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|updateComment';
export const deleteCommentBlogPostResourceRight = 'org-entcore-blog-controllers-PostController|deleteComment';

// Workflow rights of the session (`authorizedActions`), and the right to manage a blog
const listBlogsResourceRight = 'org.entcore.blog.controllers.BlogController|list';
const printBlogResourceRight = 'org.entcore.blog.controllers.BlogController|print';
const viewBlogResourceRight = 'org.entcore.blog.controllers.BlogController|blog';
const createBlogResourceRight = 'org.entcore.blog.controllers.BlogController|create';
const createPublicBlogResourceRight = 'org.entcore.blog.controllers.BlogController|createPublicBlog';
const publishBlogResourceRight = 'org.entcore.blog.controllers.BlogController|publish';
const deleteBlogResourceRight = 'org-entcore-blog-controllers-BlogController|delete';
const addBlogFolderResourceRight = 'org.entcore.blog.controllers.FoldersController|add';

/** The rights of a blog that let the user post in it. */
export type BlogPostResourceRight =
  typeof createBlogPostResourceRight | typeof submitBlogPostResourceRight | typeof publishBlogPostResourceRight;

/** The right of the user to post in a blog. */
export interface BlogPostRight {
  /** What he does when he sends a post: create (a draft), submit or publish. */
  actionRight: BlogPostResourceRight;
  /** What the app tells him he did (the toast): a submitted post is published at once in a blog `IMMEDIATE`. */
  displayRight: BlogPostResourceRight;
}

/**
 * The right of the user to post in a blog, the first that applies: publish; submit (published at once in a blog `IMMEDIATE`, waiting
 * for a validation in a blog `RESTRAINT`); create a draft. `undefined` if he can't post.
 */
export const getBlogPostRight = (blog: Blog, session: AuthActiveAccount): BlogPostRight | undefined => {
  const hasPublishRight = resourceHasRight(blog, publishBlogPostResourceRight, session);
  const hasSubmitRight = resourceHasRight(blog, submitBlogPostResourceRight, session);
  const hasCreateRight = resourceHasRight(blog, createBlogPostResourceRight, session);
  const isPublishTypeImmediate = blog['publish-type'] === 'IMMEDIATE';
  const isPublishTypeRestraint = blog['publish-type'] === 'RESTRAINT';

  if (hasPublishRight) {
    return { actionRight: publishBlogPostResourceRight, displayRight: publishBlogPostResourceRight };
  } else if (hasSubmitRight && isPublishTypeImmediate) {
    return { actionRight: submitBlogPostResourceRight, displayRight: publishBlogPostResourceRight };
  } else if (hasSubmitRight && isPublishTypeRestraint) {
    return { actionRight: submitBlogPostResourceRight, displayRight: submitBlogPostResourceRight };
  } else if (hasCreateRight) {
    return { actionRight: createBlogPostResourceRight, displayRight: createBlogPostResourceRight };
  } else return undefined;
};

/** Whether the user manages the blog: he is its author, or he can delete it. */
export const hasPermissionManager = (blog: Blog, session: AuthActiveAccount) => {
  return blog && (blog.author.userId === session.user.id || resourceHasRight(blog, deleteBlogResourceRight, session));
};

/** The workflow rights of the session on the blogs and their folders. */
export const getBlogWorkflowInformation = (session: AuthActiveAccount) => ({
  blog: {
    create: session.rights.authorizedActions.some(a => a.name === createBlogResourceRight),
    createPublic: session.rights.authorizedActions.some(a => a.name === createPublicBlogResourceRight),
    list: session.rights.authorizedActions.some(a => a.name === listBlogsResourceRight),
    print: session.rights.authorizedActions.some(a => a.name === printBlogResourceRight),
    publish: session.rights.authorizedActions.some(a => a.name === publishBlogResourceRight),
    view: session.rights.authorizedActions.some(a => a.name === viewBlogResourceRight),
  },
  folder: {
    add: session.rights.authorizedActions.some(a => a.name === addBlogFolderResourceRight),
  },
});

/** The blogs where the user can post (right to create a post), out of the trash. */
export const getPublishableBlogs = (session: AuthActiveAccount, blogs: BlogList) =>
  (resourceRightFilter(blogs, createBlogPostResourceRight, session) as BlogList).filter((blog: Blog) => !blog.trashed);

/** The rights on a blog (`computeRights`) that let the user comment its posts. A rule of the web client: the server doesn't check it. */
const rightsThatCanComment = new Set(['creator', 'comment']);

/** Whether the user can comment the posts of a blog: he created it, or he was given the right to comment. */
export const computeCanComment = (blog: Pick<Blog, 'rights'>, session: AuthActiveAccount) =>
  computeRights(blog, session).some(right => rightsThatCanComment.has(right));

/** A comment or a reply, as `comments` shows it. Of a deleted one, only its id and its date. */
const toThreadItem = (comment: BlogPostComment, accountTypes: Partial<Record<string, AccountType>>) => {
  const date = Temporal.Instant.fromEpochMilliseconds(comment.created.valueOf());
  if (comment.deleted)
    return { date, deleted: true, id: comment.id } as Omit<AnyReplyItem, 'authorId' | 'authorName' | 'authorAccountType'>;
  return {
    // A user not found (the server gives no type) is shown as a guest
    authorAccountType: accountTypes[comment.author.userId] ?? AccountType.Guest,
    authorId: comment.author.userId,
    authorName: comment.author.username,
    content: comment.comment,
    date,
    id: comment.id,
    isRichContent: false,
  };
};

/**
 * The comments of a post as `comments` shows them: the comments, the most recent first, each with its replies, the oldest first. A
 * deleted comment keeps its replies. A reply to a comment that is not given is left out.
 * @param accountTypes the types of account of the authors (`userId` → type).
 */
export const getCommentsThread = (
  comments: BlogPostComments,
  accountTypes: Partial<Record<string, AccountType>>,
): BlogPostCommentsThread => {
  const repliesByComment = new Map<string, AnyReplyItem[]>();
  const thread: AnyCommentItem[] = [];
  for (const comment of comments) {
    const item = toThreadItem(comment, accountTypes);
    if (comment.replyTo) {
      const replies = repliesByComment.get(comment.replyTo) ?? [];
      replies.push(item as AnyReplyItem);
      repliesByComment.set(comment.replyTo, replies);
    } else thread.push({ ...item, replies: [] } as AnyCommentItem);
  }
  thread.sort((a, b) => Temporal.Instant.compare(b.date, a.date));
  for (const comment of thread) {
    comment.replies = (repliesByComment.get(comment.id) ?? []).sort((a, b) => Temporal.Instant.compare(a.date, b.date));
  }
  return thread;
};

/** The number of comments of a post, the deleted ones apart. */
export const countComments = (post: BlogPost) => post.comments?.reduce((acc, c) => (c.deleted ? acc : acc + 1), 0) ?? 0;
