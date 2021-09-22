// Libraries
import I18n from "i18n-js";
import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";

// Actions

import {
  action_toggleNotifPrefsByApp,
  includeNotifKeys,
  DEPRECATED_loadNotificationPrefs,
  setNotificationPref
} from "../../user/actions/notifPrefs";

// Components
import { Back } from "../../ui/headers/Back";
import { Header, HeaderIcon, Title } from "../../ui/headers/Header";

import { Loading } from "../../ui";
import DEPRECATED_ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { H4 } from "../../ui/Typography";
import { NotifPrefLine } from "../components/NotifPrefLine";
import { NavigationScreenProp } from "react-navigation";
import { alternativeNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import withViewTracking from "../../framework/util/tracker/withViewTracking";
import { Trackers } from "../../framework/util/tracker";
import { loadPushNotifsSettingsAction } from "../../framework/modules/timelinev2/actions/notifSettings";

// Type definitions

// Misc

// Header -----------------------------------------------------------------------------------------

// tslint:disable-next-line:max-classes-per-file
export class NotifPrefsPageHeader extends React.PureComponent<
  {
    navigation: any;
  },
  undefined
  > {
  public render() {
    return (
      <Header>
        <Back navigation={this.props.navigation} />
        <Title>{I18n.t("directory-notificationsTitle")}</Title>
        <HeaderIcon name={null} hidden={true} />
      </Header>
    );
  }
}

export const NotifPrefsPageNavigationOptions = ({ navigation }: { navigation: NavigationScreenProp<{}> }) =>
  alternativeNavScreenOptions(
    {
      headerLeft: <HeaderBackAction navigation={navigation} />,
      title: I18n.t("directory-notificationsTitle"),
    },
    navigation
  );

// Props definition -------------------------------------------------------------------------------

export interface INotifPrefsPageDataProps {
  notificationPrefs: any;
  availableApps: any;
  legalapps: any;
}

export interface INotifPrefsPageEventProps {
  // TODO : move these async event handers into a dispatched action ?
  onInit: () => void;
  onTogglePref: (notification, value, notificationPrefs) => void;
}

export interface INotifPrefsPageOtherProps {
  navigation: any;
}

export type INotifPrefsPageProps = INotifPrefsPageDataProps &
  INotifPrefsPageEventProps &
  INotifPrefsPageOtherProps;

// tslint:disable-next-line:max-classes-per-file
export class NotifPrefsPage extends React.PureComponent<
  INotifPrefsPageProps,
  undefined
  > {
  public componentDidMount() {
    this.props.onInit();
  }

  public setPref(pref, value) {
    this.props.onTogglePref(pref, value, this.props.notificationPrefs);
    Trackers.trackEvent("Profile", "TOGGLE PUSH NOTIF", pref, value ? 1 : 0);
  }

  public isAllowed(notifPref) {
    // Compute a good version of uppercased allowed apps.
    const { availableApps } = this.props;
    const availableAppsWithUppercase = {};
    Object.keys(availableApps).forEach(app => {
      availableAppsWithUppercase[app] = availableApps[app];
      availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
    });
    // Do verification
    const stringCapitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);

    if (
      !availableAppsWithUppercase.hasOwnProperty(notifPref.type) && // TODO: Get the available apps NOT from timeline
      notifPref.type !== "MESSAGERIE" &&
      notifPref.type !== "HOMEWORKS" &&
      notifPref.type !== "WORKSPACE"
    )
      return false;

    if (
      !this.props.legalapps.includes(
        stringCapitalize(notifPref["type"].toLowerCase())
      )
    )
      return false;
    return true;
  }

  public isAppAllowed(appName) {
    // Compute a good version of uppercased allowed apps.
    // console.log("is app allowed ?", appName, this.props.legalapps);
    const { availableApps } = this.props;
    const availableAppsWithUppercase = {};
    Object.keys(availableApps).forEach(app => {
      availableAppsWithUppercase[app] = availableApps[app];
      availableAppsWithUppercase[app.toUpperCase()] = availableApps[app];
    });
    const stringCapitalize = (str: string) =>
      str.charAt(0).toUpperCase() + str.slice(1);
    // Do verification
    if (
      !availableAppsWithUppercase.hasOwnProperty(appName.toUpperCase()) && // TODO: Get the available apps NOT from timeline
      appName.toUpperCase() !== "MESSAGERIE" &&
      appName.toUpperCase() !== "HOMEWORKS" &&
      appName.toUpperCase() !== "WORKSPACE"
    )
      return false;
    if (!this.props.legalapps.includes(stringCapitalize(appName.toLowerCase())))
      return false;
    return true;
  }

  public render() {
    if (Object.keys(this.props.notificationPrefs).length === 0) {
      return <Loading />;
    }
    // console.log("this.props.notificationPrefs", this.props.notificationPrefs);
    const notifPrefsLines = [
      ...new Set(
        Object.values(this.props.notificationPrefs).map(pref =>
          pref["type"].toLowerCase()
        )
      )
    ];
    // console.log("notifPrefLines", notifPrefsLines);

    return (
      <PageContainer>
        <DEPRECATED_ConnectionTrackingBar />
        <ScrollView>
          <H4>{I18n.t("directory-notificationsTitle")}</H4>
          {notifPrefsLines
            .filter(appName => this.isAppAllowed(appName))
            .map((appName: string) => (
              <NotifPrefLine
                key={appName}
                i18nKey={`notif-pref-${appName}`}
                value={
                  Object.values(this.props.notificationPrefs).find(
                    pref => pref["type"].toLowerCase() === appName
                  )["push-notif"]
                }
                onCheck={() => this.setPref(appName, true)}
                onUncheck={() => this.setPref(appName, false)}
              />
            ))}
        </ScrollView>
      </PageContainer>
    );
  }
}

const NotifPrefsPageConnected = connect(
  (state: any) => {
    const sortedNotifPrefs = {};
    includeNotifKeys.map(prefName => {
      if (state.user.auth.notificationPrefs[prefName])
        sortedNotifPrefs[prefName] =
          state.user.auth.notificationPrefs[prefName];
    });
    // console.log("sortedNotifPrefs", sortedNotifPrefs);
    return {
      availableApps: state.timeline.selectedApps, // TODO: WTF ?! Profile app has to not depends on another ! Get the app list separately.
      legalapps: state.user.auth.apps,
      notificationPrefs: sortedNotifPrefs
    };
  },
  dispatch => ({
    onInit: () => {
      dispatch(DEPRECATED_loadNotificationPrefs() as any); // Legacy
      return dispatch(loadPushNotifsSettingsAction());
    },
    onTogglePref: (notification, pref, notificationPrefs) =>
      dispatch(action_toggleNotifPrefsByApp(
        notification,
        pref,
        notificationPrefs
      ) as any)
  })
)(NotifPrefsPage);

export default withViewTracking('user/notifPrefs')(NotifPrefsPageConnected);
