import I18n from "i18n-js";
import * as React from "react";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import pickFile from "../../../infra/actions/pickFile";
import withViewTracking from "../../../infra/tracker/withViewTracking";
import { CommonStyles } from "../../../styles/common/styles";
import { PageContainer } from "../../../ui/ContainerContent";
import { Text } from "../../../ui/Typography";
import { Header } from "../../../ui/headers/Header";
import { HeaderBackAction } from "../../../ui/headers/NewHeader";
import { createTicketAction, addAttachmentAction, deleteAttachmentAction } from "../actions/support";
import Support from "../components/Support";

export type INewAttachment = {
  contentType?: string;
  name?: string;
  id?: string;
  size?: number;
};

export type ITicket = {
  category: string;
    school_id: string;
    subject: string;
    description: string;
    attachments?: any[];
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

type ISupportProps = {
  navigation: NavigationScreenProp<{}>;
  categoryList: IApp[];
  establishmentsList: IEstablishment[];
  createTicket: (ticket: ITicket) => any;
  addAttachment: (attachment: object) => INewAttachment;
  deleteAttachment: (attachmentId: string) => void;
};

type ISupportState = {
  ticket: ITicket;
  tempAttachment?: any;
};

class SupportContainer extends React.PureComponent<ISupportProps, ISupportState> {
  constructor(props) {
    super(props);
    this.state = {
      ticket: {
        category: "",
        school_id: "",
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
      const newAttachment: INewAttachment = await this.props.addAttachment(file);
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

  sendTicket = async (reset: (() => void)[]) => {
    const error = this.checkTicket();
    if (error) {
      Toast.show(I18n.t(error), {
        position: Toast.position.BOTTOM,
        mask: false,
        containerStyle: { width: "95%", backgroundColor: "black" },
      });
    } else {
      try {
        const response = await this.props.createTicket(this.state.ticket);

        Toast.showSuccess(I18n.t("support-ticket-success-id") + response.id + I18n.t("support-ticket-success-info"), {
          position: Toast.position.BOTTOM,
          duration: 5000,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
        this.setState(prevState => ({ ticket: { ...prevState.ticket, subject: "", description: "", attachments: [] }, tempAttachment: null }));
        reset.forEach(reset => reset());
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
      <PageContainer>
        <Header>
          <HeaderBackAction navigation={this.props.navigation} />
          <Text
            numberOfLines={1}
            style={{
              alignSelf: "center",
              paddingRight: 10,
              marginRight: 50,
              color: "white",
              fontFamily: CommonStyles.primaryFontFamily,
              fontSize: 16,
              fontWeight: "400",
              textAlign: "center",
              flex: 1,
            }}>
            {I18n.t("support")}
          </Text>
        </Header>
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
      </PageContainer>
    );
  }
}

// ------------------------------------------------------------------------------------------------

const mapStateToProps: (state: any) => any = state => {
  const categoryList = state.user.info.appsInfo.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  const establishmentList = state.user.info.schools.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  const authorizedActions = state.user.info.authorizedActions;
  const hasRightToCreateTicket =
    authorizedActions && authorizedActions.some(action => action.displayName === "support.ticket.create");

  return {
    categoryList,
    establishmentList,
    hasRightToCreateTicket,
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
