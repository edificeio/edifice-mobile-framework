/**
 * State of `blog` in the redux store: the blogs opened, and the pages of their posts loaded, by blog.
 */
import type { PaginatedListItem } from '~/framework/components/list/paginated-list';
import type { Blog, BlogPostWithAudience } from '~/framework/modules/blog/model';

export interface BlogState {
  /** The blogs opened (list of their posts), by id. */
  blog: Record<Blog['id'], Blog>;
  /** The posts of a blog loaded so far, by page (`PaginatedFlatList`), by id of the blog. */
  posts: Record<Blog['id'], PaginatedListItem<BlogPostWithAudience>[]>;
}

/** What the selectors need of the global state: the reducer is registered under the name of the module. */
export interface BlogRootState {
  blog: BlogState;
}

export const initialState: BlogState = {
  blog: {},
  posts: {},
};
