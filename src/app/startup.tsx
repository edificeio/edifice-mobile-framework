import React from 'react';

import inAppMessaging from '@react-native-firebase/in-app-messaging';
import SplashScreen from 'react-native-splash-screen';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { I18n } from './i18n';

import { initEditor } from '~/framework/components/inputs/rich-text/editor/editor';
import { useConstructor } from '~/framework/hooks/constructor';
import { authInitAction, restoreAccountAction } from '~/framework/modules/auth/actions';
import { accountIsLoggable } from '~/framework/modules/auth/model';
import track from '~/framework/modules/auth/tracking';
import { appReadyAction, getState as getAppStartupState } from '~/framework/navigation/redux';
import { RootNavigator } from '~/framework/navigation/root-navigation';
import { tryAction } from '~/framework/util/redux/actions';
import { Storage } from '~/framework/util/storage';

const initFeatures = async () => {
  await Storage.init();
  await I18n.init();
};

function SplashScreenComponent() {
  React.useEffect(() => {
    return () => {
      SplashScreen.hide();
      inAppMessaging().setMessagesDisplaySuppressed(false).finally();
    };
  }, []);
  return null;
}

/**
 * Logic code that is run for the app start
 */
export function useAppStartup(dispatch: ThunkDispatch<any, any, any>) {
  useConstructor(async () => {
    await initFeatures();
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
    }
  });
}

export function AppStartupHandler() {
  useAppStartup(useDispatch());
  const isAppReady = useSelector(getAppStartupState).isReady;
  return isAppReady ? <RootNavigator /> : <SplashScreenComponent />;
}
