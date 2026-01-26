import React from 'react';

import { CommentsThreadInternals } from './types';

export const commentsThreadContextInitialData: CommentsThreadInternals.ContextState = {
  newCommentHeight: 0,
  newCommentValue: '',
};
export const commentsThreadContextReducer: CommentsThreadInternals.ContextReducer = (state, action) => {
  if ('newCommentValue' in action || 'newCommentHeight' in action) {
    return { ...state, ...action };
  }
  if ('editId' in action && 'editValue' in action) {
    return { newCommentHeight: state.newCommentHeight, newCommentValue: state.newCommentValue, ...action };
  }
  return state;
};
export const CommentsThreadContext = React.createContext<CommentsThreadInternals.Context>([
  commentsThreadContextInitialData,
  _ => _,
]);
