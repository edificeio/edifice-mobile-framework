import { initMesAppliAtLogin } from './reducer';

import { AppDispatch, getStore } from '~/app/store';
import { callAtLogin } from '~/framework/modules/auth/calls-at-login';

callAtLogin(() => {
  const store = getStore();
  const dispatch = store.dispatch as AppDispatch;

  dispatch(initMesAppliAtLogin());
});
