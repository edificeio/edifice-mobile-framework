import { connect } from "react-redux";
import {
  ForgotPage,
  IForgotPageDataProps,
  IForgotPageEventProps
} from "../components/ForgotPage";
import userConfig from "../config";
import { action_forgotSubmit, action_forgotReset } from "../actions/forgot";
import { IUserForgotState } from "../reducers/forgot";
import withViewTracking from "../../framework/util/tracker/withViewTracking";

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
    onSubmit(model, forgotId) {
      return dispatch(action_forgotSubmit(model, forgotId));
    },
    onReset() {
      return dispatch(action_forgotReset());
    }
  };
};

const ConnectedForgotPage = connect(
  mapStateToProps,
  mapDispatchToProps
)(ForgotPage);

export default withViewTracking('auth/forgot')(ConnectedForgotPage);