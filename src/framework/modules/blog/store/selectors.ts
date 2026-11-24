import type { Blog } from '~/framework/modules/blog/model';

import type { BlogRootState } from './state';

/** A blog opened. Throws if it isn't loaded: read it once loaded (`loadBlog`). */
export const selectBlog = (id: Blog['id']) => (state: BlogRootState) => {
  const blog = state.blog.blog[id];
  if (!blog) throw new Error(`Blog: no blog found at id = ${id}`);
  return blog;
};

/** The posts of a blog loaded so far, `undefined` before the first page. */
export const selectPosts = (id: Blog['id']) => (state: BlogRootState) =>
  state.blog.posts[id] as BlogRootState['blog']['posts'][string] | undefined;
