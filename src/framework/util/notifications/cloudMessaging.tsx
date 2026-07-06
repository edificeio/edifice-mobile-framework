/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */
import React, { PropsWithChildren, useState } from 'react';

import messaging, { RemoteMessage } from '@react-native-firebase/messaging';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';

import { navigationRef } from '~/app/navigation';
import { useNavigationRedirectionDispatch } from '~/app/navigation/use-confirm-remove';
import { IGlobalState } from '~/app/store';
import { startLoadNotificationsAction } from '~/framework/modules/timeline/actions';

import { defaultNotificationActionStack, handleNotificationAction } from './routing';

import { IEntcoreTimelineNotification, notificationAdapter } from '.';

const CloudMessagingContext = React.createContext<() => void>(() => {});

export function CloudMessagingProvider({ children }: PropsWithChildren) {
  const [remoteMessage, setRemoteMessage] = useState<RemoteMessage | null>(null);
  const isInitialRef = React.useRef(true);
  const dispatch = useDispatch<ThunkDispatch<IGlobalState, any, Action>>();
  const navigation = useNavigation<NavigationProp<ParamListBase, keyof ParamListBase, string>>();
  const navDispatch = useNavigationRedirectionDispatch(isInitialRef.current ? navigation : navigationRef);

  React.useEffect(() => {
    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(message => {
        setRemoteMessage(message);
      });

    // Listen to notification opening
    const unsubscribe = messaging().onNotificationOpenedApp(message => {
      setRemoteMessage(message);
      isInitialRef.current = false;
    });

    // Clear listener
    return () => {
      unsubscribe();
    };
  }, []);

  const handleNotification = React.useCallback(() => {
    try {
      if (!remoteMessage || !remoteMessage.data) return;

      // 1. Parse remoteMessage data
      const notificationData = {
        ...remoteMessage.data,
        params:
          remoteMessage.data.params &&
          (typeof remoteMessage.data.params === 'string' ? JSON.parse(remoteMessage.data.params) : remoteMessage.data.params),
      } as IEntcoreTimelineNotification;
      const notification = notificationAdapter(notificationData);

      // 2. Handle notification
      dispatch(startLoadNotificationsAction()); // Lasy-load, no need to await here.
      dispatch(
        handleNotificationAction(
          notification,
          defaultNotificationActionStack,
          isInitialRef.current ? navigation : navigationRef,
          navDispatch,
          'Push Notification',
          true,
        ),
      );
      setRemoteMessage(null);
    } catch {
      // ToDo: error in handling parsing notification
    }
  }, [dispatch, navDispatch, navigation, remoteMessage]);

  return <CloudMessagingContext.Provider value={handleNotification}>{children}</CloudMessagingContext.Provider>;
}

export function CloudMessagingNavigationHandler() {
  const handleNotification = React.useContext(CloudMessagingContext);
  React.useEffect(() => {
    handleNotification();
  }, [handleNotification]);
  return null;
}
