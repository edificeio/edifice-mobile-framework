import * as React from "react";
import { connect } from "react-redux";
import {
  FederatedAccountPage,
  IFederatedAccountPageEventProps
} from "../components/FederatedAccount";
import { Linking } from "react-native";
import Conf from "../../../ode-framework-conf";

const mapDispatchToProps: (dispatch) => IFederatedAccountPageEventProps = dispatch => {
  return {
    dispatch,
    onLink() {
      Linking.openURL(Conf.currentPlatform.url + "/userbook/mon-compte#/edit-me");
    },
  };
};

export default connect(
  () => ({}),
  mapDispatchToProps
)(FederatedAccountPage);
