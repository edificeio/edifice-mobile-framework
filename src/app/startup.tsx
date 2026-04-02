import React from 'react';

import inAppMessaging from '@react-native-firebase/in-app-messaging';
import BootSplash from 'react-native-bootsplash';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import AppNavigation from './navigation';

import { initEditor } from '~/framework/components/inputs/rich-text/editor/editor';
import { useConstructor } from '~/framework/hooks/constructor';
import { accountIsLoggable } from '~/framework/modules/auth/model';
import { authInitAction, restoreAccountAction } from '~/framework/modules/auth/thunks';
import track from '~/framework/modules/auth/tracking';
import { appReadyAction, getState as getAppStartupState } from '~/framework/navigation/redux';
import { tryAction } from '~/framework/util/redux/actions';

/**
 * Logic code that is run for the app start
 */
export function useAppStartup(dispatch: ThunkDispatch<any, any, any>) {
  useConstructor(async () => {
    try {
      const tryRestore = tryAction(restoreAccountAction, {
        track: track.loginRestore,
      });
      const startupAccount = await (dispatch(authInitAction()) as unknown as ReturnType<ReturnType<typeof authInitAction>>); // TS-issue with dispatch async
      if (startupAccount && accountIsLoggable(startupAccount)) {
        await (dispatch(tryRestore(startupAccount)) as unknown as ReturnType<ReturnType<typeof restoreAccountAction>>); // TS-issue with dispatch async
      }
    } catch (e) {
      console.error('[Startup] Startup failed. Cause :', e);
    } finally {
      initEditor().finally(null);
      dispatch(appReadyAction());
      BootSplash.hide({ fade: true });
      inAppMessaging().setMessagesDisplaySuppressed(false).finally();
    }
  });
}

export function AppStartupHandler() {
  useAppStartup(useDispatch());
  const isAppReady = useSelector(getAppStartupState).isReady;

  return isAppReady ? <AppNavigation /> : null;
}
