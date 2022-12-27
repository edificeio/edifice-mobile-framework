import { connect } from 'react-redux';

import withViewTracking from '~/framework/util/tracker/withViewTracking';
import { actionForgotReset, actionForgotSubmit } from '~/user/actions/forgot';
import { ForgotPage, IForgotPageDataProps, IForgotPageEventProps } from '~/user/components/ForgotPage';
import userConfig from '~/user/config';
import { IUserForgotState } from '~/user/reducers/forgot';

const mapStateToProps: (state: any) => IForgotPageDataProps = state => {
  const forgotState: IUserForgotState = state[userConfig.reducerName].forgot;
  return {
    fetching: forgotState.fetching,
    result: forgotState.result,
  };
};

const mapDispatchToProps: (dispatch) => IForgotPageEventProps = dispatch => {
  return {
    dispatch,
    onSubmit(model, forgotId) {
      return dispatch(actionForgotSubmit(model, forgotId));
    },
    onReset() {
      return dispatch(actionForgotReset());
    },
  };
};

const ConnectedForgotPage = connect(mapStateToProps, mapDispatchToProps)(ForgotPage);

export default withViewTracking('auth/forgot')(ConnectedForgotPage);
