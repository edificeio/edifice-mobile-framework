import * as React from "react";
import { connect } from "react-redux";
import {
  ForgotPage,
  IForgotPageDataProps,
  IForgotPageEventProps
} from "../components/ForgotPage";
import userConfig from "../config";
import { action_forgotSubmit, action_forgotReset } from "../actions/forgot";
import { IUserForgotState } from "../reducers/forgot";

const mapStateToProps: (state: any) => IForgotPageDataProps = state => {
  const forgotState: IUserForgotState = state[userConfig.reducerName].forgot;
  return {
    fetching: forgotState.fetching,
    result: forgotState.result
  };
};

const mapDispatchToProps: (dispatch) => IForgotPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit(model) {
      return dispatch(action_forgotSubmit(model.login));
    },
    onReset() {
      return dispatch(action_forgotReset());
    }
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPage);
