/**
 * Redux store of `wiki` (see `WikiState`). Emptied when the session ends.
 */
import type { ThunkDispatch } from 'redux-thunk';

import { createSessionReducer } from '~/framework/util/redux/reducerFactory';

import { WikiAction, wikiActionTypes } from './action-creators';
import { initialState, WikiRootState, WikiState } from './state';

/** The dispatch of the screens, for the thunks of `actions.ts`. */
export type WikiDispatch = ThunkDispatch<WikiRootState, unknown, WikiAction>;

/** The action of a type: a handler only gets the actions of its type. */
type ActionOf<Type extends WikiAction['type']> = Extract<WikiAction, { type: Type }>;

// The reducer gets every action of the app (not only `WikiAction`): redux types the store from reducers that accept any action
const reducer = createSessionReducer<WikiState>(initialState, {
  [wikiActionTypes.pageLoaded]: (state, action) => {
    const { data } = action as ActionOf<typeof wikiActionTypes.pageLoaded>;
    return { ...state, pages: { ...state.pages, [data.id]: data } };
  },
  [wikiActionTypes.wikiLoaded]: (state, action) => {
    const { data } = action as ActionOf<typeof wikiActionTypes.wikiLoaded>;
    return { ...state, wikis: { ...state.wikis, [data.assetId]: data } };
  },
});

export default reducer;

export * from './action-creators';
export * from './selectors';
export * from './state';
