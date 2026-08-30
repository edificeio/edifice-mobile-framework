import React from 'react';

import { SocialResourceViewerInternals } from './types';

export const socialResourceViewerContextInitialData: SocialResourceViewerInternals.ContextState = {
  newCommentHeight: 0,
  newCommentValue: '',
  newResponseId: undefined,
  newResponseValue: '',
};
export const socialResourceViewerContextReducer: SocialResourceViewerInternals.ContextReducer = (state, values) => ({
  ...state,
  ...values,
});
export const SocialResourceViewerContext = React.createContext<SocialResourceViewerInternals.Context>([
  socialResourceViewerContextInitialData,
  _ => _,
]);
