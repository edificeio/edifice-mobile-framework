/**
 * What the user does in `blog`: open a blog and its posts, send, change, publish or delete a post, comment. They receive the session:
 * the screen has it (`withSession`). The ones that fill the store (the blog opened, the pages of its posts) are thunks; the others are
 * plain async functions, whose result goes back to the screen.
 */
import type { ThunkAction } from 'redux-thunk';

import type {
  Blog,
  BlogPost,
  BlogPostAudience,
  BlogPostCommentIds,
  BlogPostDetails,
  BlogPostIds,
  BlogPostWithAudience,
} from '~/framework/modules/blog/model';
import {
  getBlogPostRight,
  getCommentsThread,
  getPublishableBlogs,
  publishBlogPostResourceRight,
  submitBlogPostResourceRight,
} from '~/framework/modules/blog/model/business';
import { blogService } from '~/framework/modules/blog/service';
import { BlogAction, blogActions, BlogRootState } from '~/framework/modules/blog/store';
import { resourceHasRight } from '~/framework/util/resourceRights';
import { audienceService } from '~/modules/audience/service';
import type { AuthActiveAccount } from '~/modules/auth/model';

type BlogThunk<Result> = ThunkAction<Promise<Result>, BlogRootState, unknown, BlogAction>;

/** States of the posts listed: the drafts are not. */
const LISTED_POST_STATES = ['PUBLISHED', 'SUBMITTED'];

/** Loads a blog into the store (`selectBlog`). Throws if it fails. */
export const loadBlog =
  (session: AuthActiveAccount, blogId: string): BlogThunk<void> =>
  async dispatch => {
    dispatch(blogActions.blogLoaded(await blogService.get(session, blogId)));
  };

/** The views and the reactions of posts (`audience`), added to them. Throws if one fails. */
const withAudience = async (posts: BlogPost[]): Promise<BlogPostWithAudience[]> => {
  try {
    const ids = posts.map(p => p._id);
    const [viewsForPosts, reactionsForPosts] = await Promise.all([
      audienceService.view.getSummary('blog', 'post', ids),
      audienceService.reaction.getSummary('blog', 'post', ids),
    ]);
    return posts.map(p => {
      const reactions = reactionsForPosts.reactionsByResource[p._id];
      return {
        ...p,
        audience: {
          reactions: {
            total: reactions?.totalReactionsCounter ?? 0,
            types: reactions?.reactionTypes ?? [],
            userReaction: reactions?.userReaction ?? null,
          },
          views: viewsForPosts[p._id],
        },
      } as BlogPostWithAudience;
    });
  } catch (e) {
    console.error('[BlogPostListScreen] fetchAudience error :', e);
    throw e;
  }
};

/**
 * Loads a page of the posts of a blog (published or submitted), with their audience, into the store (`selectPosts`).
 * `reloadAll` drops the pages loaded before. Throws if it fails.
 */
export const loadPostsPage =
  (session: AuthActiveAccount, blogId: string, page: number, pageSize: number, reloadAll: boolean): BlogThunk<void> =>
  async dispatch => {
    const [posts, totals] = await Promise.all([
      blogService.posts.page(session, blogId, page, pageSize, LISTED_POST_STATES),
      blogService.posts.total(session, blogId),
    ]);
    const postsWithAudience = await withAudience(posts);
    dispatch(
      blogActions.postsPageLoaded(
        blogId,
        page * pageSize,
        postsWithAudience,
        totals.countPublished + totals.countSubmitted,
        reloadAll,
      ),
    );
  };

/** The views and the reactions of a post. Throws if one fails. */
export const loadBlogPostAudience = async (postId: string): Promise<BlogPostAudience> => {
  const [views, reactions] = await Promise.all([
    audienceService.view.getSummary('blog', 'post', [postId]),
    audienceService.reaction.getSummary('blog', 'post', [postId]),
  ]);
  // A post without reactions may be missing from the summary: the same defaults as in the list
  const postReactions = reactions.reactionsByResource[postId];
  return {
    reactions: {
      total: postReactions?.totalReactionsCounter ?? 0,
      types: postReactions?.reactionTypes ?? [],
      userReaction: postReactions?.userReaction ?? null,
    },
    views: views[postId],
  } as BlogPostAudience;
};

/**
 * A post and its comments, also as a thread with the types of account of their authors (`commentsThread`). Without its state
 * (`PUBLISHED`…), it is read first (see `blogService.post.get`). Throws if it fails.
 */
export const loadBlogPostDetails = async (
  session: AuthActiveAccount,
  ids: BlogPostIds,
  state?: string,
): Promise<BlogPostDetails> => {
  const [post, comments] = await Promise.all([blogService.post.get(session, ids, state), blogService.comments.get(session, ids)]);
  const authorIds = [...new Set(comments.filter(comment => !comment.deleted).map(comment => comment.author.userId))];
  const accountTypes = await blogService.accountTypes(session, authorIds);
  return { ...post, comments, commentsThread: getCommentsThread(comments, accountTypes) };
};

/** The blogs where the user can post. Throws if it fails. */
export const loadPublishableBlogs = async (session: AuthActiveAccount) =>
  getPublishableBlogs(session, await blogService.list(session));

/**
 * Creates a post, then submits or publishes it, as the right of the user on the blog says (`getBlogPostRight`). Throws if the user
 * can't post or a step fails (the post then stays a draft).
 */
export const sendBlogPost = async (session: AuthActiveAccount, blog: Blog, postTitle: string, postContent: string) => {
  const blogPostRight = getBlogPostRight(blog, session);
  if (!blogPostRight) {
    throw new Error('[sendBlogPost] user has no post rights for this blog');
  }
  const postId = await blogService.post.create(session, blog.id, postTitle, postContent);
  if (!postId) {
    throw new Error('[sendBlogPost] failed to access id of created post');
  }
  if (blogPostRight.actionRight === publishBlogPostResourceRight) {
    await blogService.post.publish(session, blog.id, postId);
  } else if (blogPostRight.actionRight === submitBlogPostResourceRight) {
    await blogService.post.submit(session, blog.id, postId);
  }
};

/**
 * Changes a post, then publishes it again if the user can publish and it wasn't waiting for a validation; submits it otherwise.
 * Throws if the user can't post or a step fails.
 */
export const editBlogPost = async (
  session: AuthActiveAccount,
  blog: Blog,
  postId: string,
  postTitle: string,
  postContent: string,
  postState: string,
) => {
  const blogPostRight = getBlogPostRight(blog, session);
  if (!blogPostRight) {
    throw new Error('[editBlogPost] user has no post rights for this blog');
  }
  await blogService.post.edit(session, blog.id, postId, postTitle, postContent);
  const hasPublishBlogPostRight = resourceHasRight(blog, publishBlogPostResourceRight, session);
  if (!hasPublishBlogPostRight || postState === 'SUBMITTED') await blogService.post.submit(session, blog.id, postId);
  else await blogService.post.publish(session, blog.id, postId);
};

/** Publishes a submitted post. Throws if it fails. */
export const publishBlogPost = (session: AuthActiveAccount, { blogId, postId }: BlogPostIds) =>
  blogService.post.publish(session, blogId, postId);

/** Deletes a post. Throws if it fails. */
export const deleteBlogPost = (session: AuthActiveAccount, ids: BlogPostIds) => blogService.post.delete(session, ids);

/** Publishes a comment, or a reply to the comment `replyTo`. Throws if it fails. */
export const publishBlogPostComment = (session: AuthActiveAccount, ids: BlogPostIds, comment: string, replyTo?: string) =>
  blogService.comments.publish(session, ids, comment, replyTo);

/** Changes a comment. Throws if it fails. */
export const updateBlogPostComment = (session: AuthActiveAccount, ids: BlogPostCommentIds, comment: string) =>
  blogService.comments.update(session, ids, comment);

/** Deletes a comment. Throws if it fails. */
export const deleteBlogPostComment = (session: AuthActiveAccount, ids: BlogPostCommentIds) =>
  blogService.comments.delete(session, ids);
