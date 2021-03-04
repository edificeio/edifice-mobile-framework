import I18n from "i18n-js";
import * as React from "react";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../App";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { createTicketAction } from "../actions/support";
import Support from "../components/Support";

class SupportContainer extends React.PureComponent<any, any> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<any> }) =>
    standardNavScreenOptions(
      {
        title: I18n.t("support"),
      },
      navigation
    );

  constructor(props) {
    super(props);
    this.state = {
      ticket: {
        category: "",
        establishment: "",
        subject: "",
        description: "",
        attachments: [],
      },
    };
  }

  public render() {
    return (
      <Support
        {...this.props}
        onFieldChange={field =>  this.setState(prevState => ({ ticket: { ...prevState.ticket, ...field } }))}
        onCategoriesChange={category =>
          this.setState(prevState => ({ ticket: { ...prevState.ticket.category, category } }))
        }
        onEstablishmentsChange={establishment =>
          this.setState(prevState => ({ ticket: { ...prevState.ticket.establishment, establishment } }))
        }
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const categories = getSessionInfo().apps;
  //const establishments = getSessionInfo().schools;
  const establishments = getSessionInfo().apps;
  return {
    categories,
    establishments,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      createTicket: createTicketAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default withViewTracking("support/Support")(connect(mapStateToProps, mapDispatchToProps)(SupportContainer));
