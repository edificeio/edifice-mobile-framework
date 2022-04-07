import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

type ISignetsPageContainerProps = {
  navigation: any;
};

class SignetsPageContainer extends React.PureComponent<ISignetsPageContainerProps> {
  public render() {
    return <SignetsComponent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  return {};
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(SignetsPageContainer);
