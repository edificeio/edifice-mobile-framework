/**
 * CloudMessgaging
 * All tools to manage push-notifications opening
 */
import React, { PropsWithChildren, useEffect, useState } from 'react';

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';

import { navigationRef } from '~/app/navigation';
import { useNavigationRedirectionDispatch } from '~/app/navigation/use-confirm-remove';
import { IGlobalState } from '~/app/store';
import { accountIsActive } from '~/framework/modules/auth/model';
import * as selectors from '~/framework/modules/auth/redux/selectors';
import { startLoadNotificationsAction } from '~/framework/modules/timeline/actions';

import { defaultNotificationActionStack, handleNotificationAction } from './routing';

import { IEntcoreTimelineNotification, notificationAdapter } from '.';

export const PushNotificationContext = React.createContext<
  [FirebaseMessagingTypes.RemoteMessage | undefined, (v: FirebaseMessagingTypes.RemoteMessage | undefined) => void]
>([undefined, () => {}]);

export function PushNotificationContextProvider({ children }: React.PropsWithChildren) {
  const a = useState<FirebaseMessagingTypes.RemoteMessage | undefined>(undefined);
  return <PushNotificationContext value={a}>{children}</PushNotificationContext>;
}

function AppPushNotificationHandlerComponentUnconnected(
  props: PropsWithChildren<{
    isLoggedIn: boolean;
    dispatch: ThunkDispatch<any, any, any>;
  }>,
) {
  const [notification, setNotification] = React.useContext(PushNotificationContext);
  const isInitialRef = React.useRef(true);
  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      setNotification(remoteMessage);
      isInitialRef.current = false;
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
  const navDispatch = useNavigationRedirectionDispatch(isInitialRef.current ? navigation : navigationRef);
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
        dispatch(
          handleNotificationAction(
            n,
            defaultNotificationActionStack,
            isInitialRef.current ? navigation : navigationRef,
            navDispatch,
            'Push Notification',
            true,
          ),
        );
        setNotification(undefined);
      }
    }
  }, [dispatch, isLoggedIn, navDispatch, navigation, notification, setNotification]);

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
