import React from 'react';

import { getInAppMessaging, setMessagesDisplaySuppressed } from '@react-native-firebase/in-app-messaging';
import BootSplash from 'react-native-bootsplash';
import { useDispatch, useSelector } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

// import { initEditor } from '~/framework/components/inputs/rich-text/editor/editor';
import { useConstructor } from '~/framework/hooks/constructor';
import { restoreAtStartup } from '~/modules/auth/flows';

import { AppNavigation } from './navigation-new';
import { appReadyAction, getState as getAppStartupState } from './store/startup';

/**
 * Logic code that is run for the app start
 */
export function useAppStartup(dispatch: ThunkDispatch<any, any, any>) {
  useConstructor(async () => {
    try {
      await restoreAtStartup();
    } catch (e) {
      console.error('[Startup] Startup failed. Cause :', e);
    } finally {
      // ToDo: put these custom logic bits where it belongs to
      // initEditor().finally(null); // -> rich-editor
      dispatch(appReadyAction()); // -> switch to async component
      BootSplash.hide({ fade: true }); // -> switch to async component
      setMessagesDisplaySuppressed(getInAppMessaging(), false).catch(e =>
        console.warn('[InAppMessaging] Unable to change messages display suppression:', e),
      ); // -> refacto with app.tsx logic
    }
  });
}

export function AppStartupHandler() {
  useAppStartup(useDispatch());
  const isAppReady = useSelector(getAppStartupState).isReady;
  return isAppReady && <AppNavigation />;
}
