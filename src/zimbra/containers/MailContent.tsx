import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { HeaderBackAction } from "../../ui/headers/NewHeader";
import { fetchMailContentAction } from "../actions/mailContent";
import MailContent from "../components/MailContent";
import { getMailContentState } from "../state/mailContent";

class MailContentContainer extends React.PureComponent<any, any> {
  public componentDidMount() {
    this.props.fetchMailContentAction(this.props.navigation.state.params.mailId);
  }

  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) => {
    return standardNavScreenOptions(
      {
        title: I18n.t("zimbra-inbox"),
        headerLeft: <HeaderBackAction navigation={navigation} />,
      },
      navigation
    );
  };

  public render() {
    return <MailContent {...this.props} />;
  }
}

const mapStateToProps: (state: any) => any = state => {
  const { isPristine, isFetching, data } = getMailContentState(state);

  return {
    isPristine,
    isFetching,
    mail: data,
  };
};

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators({ fetchMailContentAction }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(MailContentContainer);
