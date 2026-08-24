import * as React from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { dismissFlashMessageAction, loadFlashMessagesAction } from '~/framework/modules/timeline/actions';
import timelineConfig from '~/framework/modules/timeline/module-config';

export function useFlashMessages() {
  const dispatch = useDispatch<ThunkDispatch<any, any, any>>();

  const messages = useSelector(state => timelineConfig.getState(state).flashMessages.data);
  const pristine = useSelector(state => timelineConfig.getState(state).flashMessages.isPristine);

  const load = React.useCallback(() => dispatch(loadFlashMessagesAction()), [dispatch]);
  const dismiss = React.useCallback((id: number) => dispatch(dismissFlashMessageAction(id)), [dispatch]);

  const visible = React.useMemo(() => messages.filter(message => !message.dismiss), [messages]);

  return { dismiss, load, pristine, visible };
}
