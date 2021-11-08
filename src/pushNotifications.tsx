import Conf from "../ode-framework-conf";
import moduleDefinitions from "./AppModules";
import { NotificationData, NotificationHandlerFactory } from "./infra/pushNotification";
import timelineHandlerFactory from "./timeline/NotifHandler";
import { Linking } from "react-native";
import { Trackers } from "./framework/util/tracker";
import React, { useState, useEffect, FunctionComponent } from 'react';
import { connect } from "react-redux";

// Firebase
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { ThunkDispatch } from "redux-thunk";
import SplashScreen from "react-native-splash-screen";

const normalizeUrl = (url:string)=>{
  try{
    return url.replace(/([^:]\/)\/+/g, "$1");
  }catch(e){
    return url;
  }
}

export async function requestUserPermission() {
  const authorizationStatus = await messaging().requestPermission();

  if (authorizationStatus) {
    console.log('Permission status:', authorizationStatus);
  }
}

export const handleNotificationAction = (data: NotificationData, apps: string[], trackType: false | string = "Push Notification") =>
  async (dispatch: ThunkDispatch<any, any, any>, getState: () => any) => {
    // function for calling handlerfactory
    let manageCount = 0;
    const call = async (notifHandlerFactory: NotificationHandlerFactory<any, any, any>) => {
      try {
        const managed = await notifHandlerFactory(dispatch, getState)(data, apps, trackType);
        if (managed) {
          manageCount++;
        }
      } catch (e) {
        console.warn("[pushNotification] Failed to dispatch handler: ", e);
      }
    }
    //timeline is not a functionalmodule
    await call(timelineHandlerFactory);
    //notify functionnal module
    for (let handler of moduleDefinitions) {
      if (handler && handler.config && handler.config.notifHandlerFactory) {
        const func = await handler.config.notifHandlerFactory();
        await call(func);
      }
    }
    //if no handler managed the notification => redirect to web
    if (!manageCount) {
      if (!Conf.currentPlatform) {
        throw new Error("Must have a platform selected to redirect the user");
      }
      const url = normalizeUrl(`${(Conf.currentPlatform as any).url}/${data.resourceUri}`)
      console.log("data", data.resourceUri.split('/'));
      const notifPathBegin = '/' + data.resourceUri.replace(/^\/+/g, '').split('/')[0];
      trackType && Trackers.trackEvent(trackType, "Browser", notifPathBegin);
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.warn("[pushNotification] Don't know how to open URI: ", url);
        }
      });
    }
  }

const _AppPushNotificationHandlerComponent: FunctionComponent<{ isLoggedIn: boolean, apps: string[], dispatch: ThunkDispatch<any, any, any>}> = (props) => {
  const [notification, setNotification] = useState<FirebaseMessagingTypes.RemoteMessage | undefined>(undefined);

  useEffect(() => {
    // Assume a message-notification contains a "type" property in the data payload of the screen to open

    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
      setNotification(remoteMessage);
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          setNotification(remoteMessage);
        }
      });
  }, []);

  if (notification && props.isLoggedIn) {
    console.log('Handling notification:', notification);
    if (notification.data && notification.data.params) {
      const notificationData = JSON.parse(notification.data.params);
      props.dispatch(handleNotificationAction(notificationData, props.apps))
      setNotification(undefined);
    }
    SplashScreen.hide();
  }
  return <>{props.children}</>
}

const mapStateToProps: (s: any) => any = (s) => {
  return {
    isLoggedIn: s?.user?.auth?.loggedIn,
    apps: s?.user?.auth?.apps
  };
};

export const AppPushNotificationHandlerComponent = connect(mapStateToProps)(_AppPushNotificationHandlerComponent);
