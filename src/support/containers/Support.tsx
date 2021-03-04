import I18n from "i18n-js";
import * as React from "react";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../App";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { createTicketAction } from "../actions/support";
import Support from "../components/Support";

type SupportProps = {
  createTicket: (ticket) => void;
};

type SupportState = {
  ticket: {
    category: string;
    establishment: string;
    subject: string;
    description: string;
    attachments: [];
  };
};

class SupportContainer extends React.PureComponent<SupportProps, SupportState> {
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

  sendTicket = () => {
    const { ticket } = this.state;
    if (ticket && (ticket.subject === undefined || ticket.subject === "")) {
      Toast.show(I18n.t("support-ticket-error-form-subject"), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
    } else if (ticket && (ticket.description === undefined || ticket.description === "")) {
      Toast.show(I18n.t("support-ticket-error-form-description"), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
    }
    //this.props.createTicket(ticket);
  };

  public render() {
    return (
      <Support
        {...this.props}
        onFieldChange={field => this.setState(prevState => ({ ticket: { ...prevState.ticket, ...field } }))}
        sendTicket={this.sendTicket}
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const categories = getSessionInfo().apps;
  const establishmentsList = getSessionInfo().schools;
  let establishments: string[] = [];
  Object.entries(establishmentsList).map(([key, value]) => establishments.push(value.name));
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
