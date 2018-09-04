import * as React from "react";
import { ScrollView } from "react-native";
import I18n from "react-native-i18n";
import { connect } from "react-redux";

import {
  excludeNotifTypes,
  setNotificationPref
} from "../actions/setNotificationPref";

import { Loading } from "../../ui";
import ConnectionTrackingBar from "../../ui/ConnectionTrackingBar";
import { PageContainer } from "../../ui/ContainerContent";
import { Back } from "../../ui/headers/Back";
import { Header, HeaderIcon, Title } from "../../ui/headers/Header";
import { H4 } from "../../ui/Typography";
import { loadNotificationsPrefs } from "../actions/loadNotificationsPrefs";
import { NotifPrefLine } from "../components/NotifPrefLine";

export class NotificationsSettingsHeader extends React.Component<
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

export class NotificationsSettings extends React.Component<
  {
    navigation: any;
    loadNotificationsPrefs: () => Promise<void>;
    notificationsPrefs: any;
    availableApps: any;
    setNotificationPref: (
      notification,
      value,
      notificationsPrefs
    ) => Promise<void>;
  },
  undefined
> {
  componentDidMount() {
    this.props.loadNotificationsPrefs();
  }

  setPref(pref, value) {
    this.props.setNotificationPref(pref, value, this.props.notificationsPrefs);
  }

  isAllowed(notifPref) {
    return (
      (this.props.availableApps.hasOwnProperty(notifPref.type) ||
        notifPref.type === "MESSAGERIE") &&
      excludeNotifTypes.indexOf(notifPref.key) === -1
    );
  }

  public render() {
    if (this.props.notificationsPrefs.length === 0) {
      return <Loading />;
    }
    return (
      <PageContainer>
        <ConnectionTrackingBar />
        <ScrollView>
          <H4>{I18n.t("directory-notificationsTitle")}</H4>
          {this.props.notificationsPrefs
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
    console.log(state);
    return {
      notificationsPrefs: state.auth.notificationsPrefs,
      availableApps: state.timeline.selectedApps
    };
  },
  dispatch => ({
    loadNotificationsPrefs: () => loadNotificationsPrefs(dispatch)(),
    setNotificationPref: (notification, pref, notificationsPrefs) =>
      setNotificationPref(dispatch)(notification, pref, notificationsPrefs)
  })
)(NotificationsSettings);
