import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { fetchMailListAction } from "../actions/mailList";
import MailList from "../components/MailList";
import { getMailListState } from "../state/mailList";

// ------------------------------------------------------------------------------------------------

class MailListContainer extends React.PureComponent<any, any> {
  public componentDidMount() {
    this.props.fetchMailListAction(0);
  }

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("zimbra-inbox"),
      },
      navigation
    );
  };

  public render() {
    return <MailList {...this.props} />;
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailListState(state);

  // Format props
  return {
    isPristine,
    isFetching,
    notifications: data,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ fetchMailListAction }, dispatch);
};

// ------------------------------------------------------------------------------------------------

export default connect(mapStateToProps, mapDispatchToProps)(MailListContainer);
