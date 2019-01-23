// Libraries
import I18n from "i18n-js";
import * as React from "react";
import { ScrollView } from "react-native";
import { connect } from "react-redux";

// Actions

import {
  excludeNotifTypes,
  loadNotificationPrefs,
  setNotificationPref
} from "../../user/actions/notifPrefs";

// Components
import { Back } from "../../ui/headers/Back";
import { Header, HeaderIcon, Title } from "../../ui/headers/Header";

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { H4 } from "../../ui/Typography";
import { NotifPrefLine } from "../components/NotifPrefLine";

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
      notifPref.type !== "MESSAGERIE"
    )
      return false;
    if (
      !this.props.legalapps.includes(
        stringCapitalize(notifPref["app-name"].toLowerCase())
      )
    )
      return false;
    return excludeNotifTypes.indexOf(notifPref.key) === -1;
  }

  public render() {
    if (this.props.notificationPrefs.length === 0) {
      return <Loading />;
    }
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ScrollView>
          <H4>{I18n.t("directory-notificationsTitle")}</H4>
          {this.props.notificationPrefs
            .filter(nn => this.isAllowed(nn))
            .map(pref => (
              <NotifPrefLine
                key={pref.key}
                i18nKey={pref.key}
                value={pref["push-notif"]}
                onCheck={() => this.setPref(pref, true)}
                onUncheck={() => this.setPref(pref, false)}
              />
            ))}
        </ScrollView>
      </PageContainer>
    );
  }
}

export default connect(
  (state: any) => {
    return {
      availableApps: state.timeline.selectedApps, // TODO: WTF ?! Profile app has to not depends on another ! Get the app list separately.
      legalapps: state.user.auth.apps,
      notificationPrefs: state.user.auth.notificationPrefs
    };
  },
  dispatch => ({
    onInit: () => dispatch(loadNotificationPrefs() as any),
    onTogglePref: (notification, pref, notificationPrefs) =>
      dispatch(setNotificationPref(
        notification,
        pref,
        notificationPrefs
      ) as any)
  })
)(NotifPrefsPage);
