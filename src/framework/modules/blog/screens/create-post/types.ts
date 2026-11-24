import type { Blog } from '~/framework/modules/blog/model';

export type BlogCreatePostScreenNavParams = {
  blog: Blog;
  /** The list of the posts of the blog, when the post is created from it: it is reloaded after. */
  referrer?: 'blog/list';
};
