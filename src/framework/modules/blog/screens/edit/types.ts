import type { Blog } from '~/framework/modules/blog/model';

export type BlogEditPostScreenNavParams = {
  blog: Blog;
  title: string;
  content: string;
  postId: string;
  postState: string;
};
