/**
 * Redux store of `blog` (see `BlogState`). Emptied when the session ends.
 */
import type { ThunkDispatch } from 'redux-thunk';

import { staleOrSplice } from '~/framework/components/list/paginated-list';
import type { BlogPostWithAudience } from '~/framework/modules/blog/model';
import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import { BlogAction, blogActionTypes } from './action-creators';
import { BlogRootState, BlogState, initialState } from './state';

/** The dispatch of the screens, for the thunks of `actions.ts`. */
export type BlogDispatch = ThunkDispatch<BlogRootState, unknown, BlogAction>;

/** The action of a type: a handler only gets the actions of its type. */
type ActionOf<Type extends BlogAction['type']> = Extract<BlogAction, { type: Type }>;

// The reducer gets every action of the app (not only `BlogAction`): redux types the store from reducers that accept any action
const reducer = createSessionReducer<BlogState>(initialState, {
  [blogActionTypes.blogLoaded]: (state, action) => {
    const { data } = action as ActionOf<typeof blogActionTypes.blogLoaded>;
    return { ...state, blog: { ...state.blog, [data.id]: data } };
  },
  [blogActionTypes.postsPageLoaded]: (state, action) => {
    const { blogId, data, reloadAll, start, total } = action as ActionOf<typeof blogActionTypes.postsPageLoaded>;
    return {
      ...state,
      posts: {
        ...state.posts,
        [blogId]: staleOrSplice<BlogPostWithAudience>({
          newData: data,
          previousData: state.posts[blogId],
          reloadAll,
          start,
          total,
        }),
      },
    };
  },
});

export default reducer;

export * from './action-creators';
export * from './selectors';
export * from './state';
