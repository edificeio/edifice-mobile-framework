import * as React from "react";
import { connect } from "react-redux";
import {
  FederatedAccountPage,
  IFederatedAccountPageEventProps
} from "../components/FederatedAccount";
import { Linking } from "react-native";
import Conf from "../../../ode-framework-conf";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { Trackers } from "../../infra/tracker";

const mapDispatchToProps: (dispatch) => IFederatedAccountPageEventProps = dispatch => {
  return {
    dispatch,
    onLink() {
      Trackers.trackEvent('Auth', 'GO TO', 'OTP Generation');
      Linking.openURL(Conf.currentPlatform.federationUrl || Conf.currentPlatform.url + "/userbook/mon-compte#/edit-me");
    },
  };
};

const ConnectedFederatedAccountPage = connect(
  () => ({}),
  mapDispatchToProps
)(FederatedAccountPage);

export default withViewTracking('auth/federated')(ConnectedFederatedAccountPage);
