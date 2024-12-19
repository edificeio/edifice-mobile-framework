/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */
import React, { PropsWithChildren, useEffect, useState } from 'react';

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { defaultNotificationActionStack, handleNotificationAction } from './routing';

import { IEntcoreTimelineNotification, notificationAdapter } from '.';

import { IGlobalState } from '~/app/store';
import { accountIsActive } from '~/framework/modules/auth/model';
import * as selectors from '~/framework/modules/auth/redux/selectors';
import { startLoadNotificationsAction } from '~/framework/modules/timeline/actions';

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

  const navigation = useNavigation<NavigationProp<ParamListBase, keyof ParamListBase, string>>();
  const { dispatch, isLoggedIn } = props;
  useEffect(() => {
    if (notification && isLoggedIn) {
      if (notification.data) {
        const notificationData = {
          ...notification.data,
          params: notification.data.params && JSON.parse(notification.data.params),
        } as IEntcoreTimelineNotification;
        const n = notificationAdapter(notificationData);

        dispatch(startLoadNotificationsAction()); // Lasy-load, no need to await here.
        dispatch(handleNotificationAction(n, defaultNotificationActionStack, navigation, 'Push Notification', true));
        setNotification(undefined);
      }
    }
  }, [dispatch, isLoggedIn, navigation, notification]);

  return <>{props.children}</>;
}

const mapStateToProps = (s: IGlobalState) => {
  return {
    isLoggedIn: accountIsActive(selectors.session(s)),
  };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>) => ({
  dispatch,
});

export const AppPushNotificationHandlerComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppPushNotificationHandlerComponentUnconnected);
