/**
 * Action types and action creators of `blog`: what happened, for the reducer. What the user does is in
 * `~/framework/modules/blog/actions`.
 */
import type { Blog, BlogPostWithAudience } from '~/framework/modules/blog/model';

export const blogActionTypes = {
  blogLoaded: 'BLOG_LOAD',
  postsPageLoaded: 'BLOG_POSTS_LOAD_PAGE',
} as const;

export const blogActions = {
  blogLoaded: (data: Blog) => ({ data, type: blogActionTypes.blogLoaded }),
  /** A page of posts, from `start`, out of `total`; `reloadAll` drops the pages loaded before. */
  postsPageLoaded: (blogId: Blog['id'], start: number, data: BlogPostWithAudience[], total: number, reloadAll: boolean) => ({
    blogId,
    data,
    reloadAll,
    start,
    total,
    type: blogActionTypes.postsPageLoaded,
  }),
};

export type BlogAction = ReturnType<(typeof blogActions)[keyof typeof blogActions]>;
