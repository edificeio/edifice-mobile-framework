import React from 'react';

import { SocialResourceViewerInternals } from './types';

export const socialResourceViewerContextInitialData: SocialResourceViewerInternals.ContextState = {
  newCommentHeight: 0,
  newCommentValue: '',
};
export const socialResourceViewerContextReducer: SocialResourceViewerInternals.ContextReducer = (state, action) => {
  if ('newCommentValue' in action || 'newCommentHeight' in action) {
    return { ...state, ...action };
  }
  if ('newResponseReplyTo' in action && 'newResponseValue' in action) {
    return { newCommentHeight: state.newCommentHeight, newCommentValue: state.newCommentValue, ...action };
  }
  if ('editId' in action && 'editValue' in action) {
    return { newCommentHeight: state.newCommentHeight, newCommentValue: state.newCommentValue, ...action };
  }
  return state;
};
export const SocialResourceViewerContext = React.createContext<SocialResourceViewerInternals.Context>([
  socialResourceViewerContextInitialData,
  _ => _,
]);
