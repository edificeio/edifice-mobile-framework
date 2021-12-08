import * as React from "react";
import { connect } from "react-redux";
import {
  FederatedAccountPage,
  IFederatedAccountPageEventProps
} from "../components/FederatedAccount";
import { Linking } from "react-native";
import withViewTracking from "~/framework/util/tracker/withViewTracking";
import { Trackers } from "~/framework/util/tracker";
import { DEPRECATED_getCurrentPlatform } from "~/framework/util/_legacy_appConf";

const mapDispatchToProps: (dispatch) => IFederatedAccountPageEventProps = dispatch => {
  const currentPf = DEPRECATED_getCurrentPlatform();
  const fedeUrl = typeof currentPf!.federation === 'string'
    ? currentPf!.federation
    : currentPf?.url + "/userbook/mon-compte#/edit-me";
  return {
    dispatch,
    onLink() {
      Trackers.trackEvent('Auth', 'GO TO', 'OTP Generation');
      return Linking.openURL(fedeUrl);
    },
  };
};

const ConnectedFederatedAccountPage = connect(
  () => ({}),
  mapDispatchToProps
)(FederatedAccountPage);

export default withViewTracking('auth/federated')(ConnectedFederatedAccountPage);
