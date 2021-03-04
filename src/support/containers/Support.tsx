import I18n from "i18n-js";
import * as React from "react";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { getSessionInfo } from "../../App";
import pickFile from "../../infra/actions/pickFile";
import withViewTracking from "../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../navigation/helpers/navScreenOptions";
import { createTicketAction, addAttachmentAction, deleteAttachmentAction } from "../actions/support";
import Support from "../components/Support";

export type ITicket = {
  category: string;
    establishment: string;
    subject: string;
    description: string;
    attachments: any[];
};

export type IEstablishment = {
  id: string;
  name: string;
};

export type IApp = {
  name: string;
  address: string;
  icon: string;
  target: any;
  displayName: string;
  display: boolean;
  prefix: string;
};

type SupportProps = {
  categoryList: IApp[];
  establishmentsList: IEstablishment[];
  createTicket: (ticket: ITicket) => void;
  addAttachment: (attachment: object) => void;
  deleteAttachment: (attachmentId: string) => void;
};

type SupportState = {
  ticket: ITicket;
  tempAttachment?: any;
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
      tempAttachment: null,
    };
  }

  removeAttachment = (attachmentId: string) => {
    this.props.deleteAttachment(attachmentId);
    let attachmentRemoved = this.state.ticket.attachments.find(key => key.id === attachmentId);
    let attachmentList = [...this.state.ticket.attachments];
    let index = attachmentList.indexOf(attachmentRemoved);
    if (index !== -1) {
      attachmentList.splice(index, 1);
      this.setState(prevState => ({ ticket: { ...prevState.ticket, attachments: attachmentList } }));
    }
  };

  uploadAttachment = async () => {
    const file = await pickFile();
    const fileState = {
      contentType: file.mime,
      filename: file.name,
    };
    this.setState({ tempAttachment: fileState });
    try {
      const newAttachment = await this.props.addAttachment(file);
      let joinedAttachments = this.state.ticket.attachments.concat(newAttachment);
      this.setState(prevState => ({
        ticket: { ...prevState.ticket, attachments: joinedAttachments },
        tempAttachment: null,
      }));
    } catch (e) {
      Toast.show(I18n.t("support-attachment-error"), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
      this.setState({ tempAttachment: fileState });
    }
  };

  checkTicket = () => {
    const { ticket } = this.state;
    let result;
    if (!ticket.subject) {
      result = "support-ticket-error-form-subject-empty";
    } else if (ticket.subject.length > 255) {
      result = "support-ticket-error-form-subject-size";
    } else if (!ticket.description) {
      result = "support-ticket-error-form-description-empty";
    } else {
      result = false;
    }
    return result;
  };

  sendTicket = () => {
    const error = this.checkTicket();
    if (error) {
      Toast.show(I18n.t(error), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
    } else {
      try {
        const ticketNb = this.props.createTicket(this.state.ticket);

        Toast.show(I18n.t("support-ticket-success-id") + ticketNb + I18n.t("support-ticket-success-info"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
      } catch (e) {
        Toast.show(I18n.t("support-ticket-failure"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
      }
    }
  };

  public render() {
    return (
      <Support
        {...this.props}
        ticket={this.state.ticket}
        attachments={
          this.state.tempAttachment
            ? [...this.state.ticket.attachments, this.state.tempAttachment]
            : this.state.ticket.attachments
        }
        onFieldChange={field => this.setState(prevState => ({ ticket: { ...prevState.ticket, ...field } }))}
        uploadAttachment={this.uploadAttachment}
        removeAttachment={this.removeAttachment}
        sendTicket={this.sendTicket}
      />
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const categoryList = getSessionInfo().appsInfo;
  const establishmentList = getSessionInfo().schools;
  return {
    categoryList,
    establishmentList,
  };
};

// ------------------------------------------------------------------------------------------------

const mapDispatchToProps: (dispatch: any) => any = dispatch => {
  return bindActionCreators(
    {
      createTicket: createTicketAction,
      addAttachment: addAttachmentAction,
      deleteAttachment: deleteAttachmentAction,
    },
    dispatch
  );
};

// ------------------------------------------------------------------------------------------------

export default withViewTracking("support/Support")(connect(mapStateToProps, mapDispatchToProps)(SupportContainer));
