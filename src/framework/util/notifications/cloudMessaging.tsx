/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { IGlobalState } from '~/AppStore';
import { getState as getAuthState } from '~/framework/modules/auth/reducer';
import { startLoadNotificationsAction } from '~/framework/modules/timelinev2/actions';
import timelineModuleConfig from '~/framework/modules/timelinev2/moduleConfig';

import { IEntcoreTimelineNotification, notificationAdapter } from '.';
import { defaultNotificationActionStack, handleNotificationAction } from './routing';

function AppPushNotificationHandlerComponentUnconnected(
  props: PropsWithChildren<{
    isLoggedIn: boolean;
    dispatch: ThunkDispatch<any, any, any>;
  }>,
) {
  const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | undefined>(undefined);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      setNotification(remoteMessage);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setNotification(remoteMessage);
        }
      });
  }, []);

  if (notification && props.isLoggedIn) {
    if (notification.data) {
      const notificationData = {
        ...notification.data,
        params: notification.data.params && JSON.parse(notification.data.params),
      } as IEntcoreTimelineNotification;
      const n = notificationAdapter(notificationData);

      props.dispatch(startLoadNotificationsAction()); // Lasy-load, no need to await here.
      props.dispatch(
        handleNotificationAction(n, defaultNotificationActionStack, 'Push Notification', timelineModuleConfig.routeName),
      );
      setNotification(undefined);
    }
  }

  return <>{props.children}</>;
}

const mapStateToProps = (s: IGlobalState) => {
  return {
    isLoggedIn: getAuthState(s).logged,
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>) => ({
  dispatch,
});

export const AppPushNotificationHandlerComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppPushNotificationHandlerComponentUnconnected);
