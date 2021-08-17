import { AllHtmlEntities } from "html-entities";
import I18n from "i18n-js";
import moment from "moment";
import React from "react";
import { View } from "react-native";
import Toast from "react-native-tiny-toast";
import { NavigationScreenProp } from "react-navigation";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";

import { getSessionInfo } from "../../../App";
import { IDistantFile, LocalFile, SyncedFile } from "../../../framework/util/fileHandler";
import pickFile, { pickFileError } from "../../../infra/actions/pickFile";
import {Trackers} from "../../../infra/tracker";
import withViewTracking from "../../../infra/tracker/withViewTracking";
import { standardNavScreenOptions } from "../../../navigation/helpers/navScreenOptions";
import { CommonStyles } from "../../../styles/common/styles";
import { INavigationProps } from "../../../types";
import { contentUriToLocalFile } from "../../../types/contentUri";
import { HeaderAction } from "../../../ui/headers/NewHeader";
import { trashMailsAction } from "../actions/mail";
import { fetchMailContentAction, clearMailContentAction } from "../actions/mailContent";
import {
  sendMailAction,
  makeDraftMailAction,
  updateDraftMailAction,
  addAttachmentAction,
  deleteAttachmentAction,
  forwardMailAction,
} from "../actions/newMail";
import NewMailComponent from "../components/NewMail";
import { ISearchUsers } from "../service/newMail";
import { getMailContentState, IMail } from "../state/mailContent";

const entitiesTransformer = new AllHtmlEntities();

export enum DraftType {
  NEW,
  DRAFT,
  REPLY,
  REPLY_ALL,
  FORWARD,
}

interface ICreateMailEventProps {
  sendMail: (mailDatas: object, draftId: string, inReplyTo: string) => void;
  forwardMail: (draftId: string, inReplyTo: string) => void;
  makeDraft: (mailDatas: object, inReplyTo: string, isForward: boolean) => void;
  updateDraft: (mailId: string, mailDatas: object) => void;
  trashMessage: (mailId: string[]) => void;
  onPickFileError: (notifierId: string) => void;
  addAttachment: (draftId: string, files: LocalFile) => Promise<any[]>;
  deleteAttachment: (draftId: string, attachmentId: string) => void;
  fetchMailContent: (mailId: string) => void;
  clearContent: () => void;
}

interface ICreateMailOtherProps {
  isFetching: boolean;
  mail: IMail;
  uploadProgress: number;
}

type NewMailContainerProps = ICreateMailEventProps & ICreateMailOtherProps & INavigationProps;

interface ICreateMailState {
  id?: string;
  mail: newMail;
  tempAttachment?: any;
  isPrefilling?: boolean;
  prevBody?: string;
  replyTo?: string;
}

type newMail = {
  to: ISearchUsers;
  cc: ISearchUsers;
  bcc: ISearchUsers;
  subject: string;
  body: string;
  attachments: IDistantFile[];
};

class NewMailContainer extends React.PureComponent<NewMailContainerProps, ICreateMailState> {
  static navigationOptions = ({ navigation }: { navigation: NavigationScreenProp<object> }) => {
    return standardNavScreenOptions(
      {
        title: null,
        headerLeft: () => {
          const goBack = navigation.getParam("getGoBack", navigation.goBack);

          return <HeaderAction onPress={() => goBack()} name="back" />;
        },
        headerRight: () => {
          const askForAttachment = navigation.getParam("getAskForAttachment");
          const sendDraft = navigation.getParam("getSendDraft");
          const deleteDraft = navigation.getParam("getDeleteDraft");

          return (
            <View style={{ flexDirection: "row" }}>
              {askForAttachment && (
                <HeaderAction style={{ alignSelf: "flex-end" }} onPress={askForAttachment} name="attachment" />
              )}
              {sendDraft && <HeaderAction style={{ alignSelf: "flex-end" }} onPress={sendDraft} name="outbox" />}
              {deleteDraft && <HeaderAction style={{ alignSelf: "flex-end" }} onPress={deleteDraft} name="delete" />}
            </View>
          );
        },
        headerStyle: {
          backgroundColor: CommonStyles.secondary,
        },
      },
      navigation
    );
  };

  constructor(props) {
    super(props);

    this.state = {
      mail: { to: [], cc: [], bcc: [], subject: "", body: "", attachments: [] },
      prevBody: "",
    };
  }

  componentDidMount = () => {
    this.props.navigation.setParams(this.navigationHeaderFunction);
    if (this.props.navigation.getParam("mailId") !== undefined) {
      this.setState({ isPrefilling: true });
      this.props.fetchMailContent(this.props.navigation.getParam("mailId"));
    }
    const draftType = this.props.navigation.getParam("type");
    if (draftType === DraftType.REPLY){
      Trackers.trackEvent("Zimbra", "REPLY TO ONE");
    }
    if(draftType === DraftType.REPLY_ALL){
      Trackers.trackEvent("Zimbra", "REPLY TO ALL");
    }
    if (draftType !== DraftType.DRAFT) {
      this.setState({ id: undefined });
      this.saveDraft();
    }
  };

  componentDidUpdate = async (prevProps: NewMailContainerProps, prevState) => {
    if (prevProps.mail !== this.props.mail) {
      const { mail, ...rest } = this.getPrefilledMail();
      this.setState(prevState => ({
        ...prevState,
        ...rest,
        mail: { ...prevState.mail, ...mail },
        isPrefilling: false,
      }));
    } else if (this.props.navigation.getParam("mailId") !== undefined && this.state.id === undefined)
      this.setState({ id: this.props.navigation.getParam("mailId") });
  };

  navigationHeaderFunction = {
    getAskForAttachment: (dispatch: Dispatch) => {
      console.log("will pick file");
      pickFile()
        .then(contentUri => {
          console.log("picked", contentUri);
          this.getAttachmentData(contentUriToLocalFile(contentUri));
        })
        .catch(err => {
          if (err.message === "Error picking image" || err.message === "Error picking document") {
            this.props.onPickFileError("zimbra");
          }
        });
    },
    getSendDraft: async () => {
      if (this.state.mail.to.length === 0) {
        Toast.show(I18n.t("zimbra-missing-receiver"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
        return;
      } else if (this.props.uploadProgress > 0 && this.props.uploadProgress < 100) {
        Toast.show(I18n.t("zimbra-send-attachment-progress"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
        return;
      }

      try {
        const { mail } = this.state;
        if (mail.attachments && mail.attachments.length !== 0) Trackers.trackEvent("Zimbra", "SEND ATTACHMENTS");
        this.props.sendMail(this.getMailData(), this.state.id, this.state.replyTo);

        Toast.show(I18n.t("zimbra-send-mail"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });

        const navParams = this.props.navigation.state;
        if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
        this.props.navigation.goBack();
      } catch (e) {
        console.log(e);
      }
    },
    getDeleteDraft: () => {
      if (this.state.id) {
        this.props.trashMessage([this.state.id]);
        const navParams = this.props.navigation.state;
        if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
      }
      this.props.navigation.goBack();
    },
    getGoBack: () => {
      if (this.props.uploadProgress > 0 && this.props.uploadProgress < 100) {
        Toast.show(I18n.t("zimbra-send-attachment-progress"), {
          position: Toast.position.BOTTOM,
          mask: false,
          containerStyle: { width: "95%", backgroundColor: "black" },
        });
        return;
      }
      this.saveDraft();

      const navParams = this.props.navigation.state;
      if (navParams.params && navParams.params.onGoBack) navParams.params.onGoBack();
      this.props.navigation.goBack();
    },
  };

  getPrefilledMail = () => {
    const draftType = this.props.navigation.getParam("type", DraftType.NEW);
    const getDisplayName = id => this.props.mail.displayNames.find(([userId]) => userId === id)[1];
    const getUser = id => ({ id, displayName: getDisplayName(id) });

    const deleteHtmlContent = function(text) {
      const regexp = /<(\S+)[^>]*>(.*)<\/\1>/gs;

      if (regexp.test(text)) {
        return deleteHtmlContent(text.replace(regexp, "$2"));
      } else {
        return entitiesTransformer.decode(text);
      }
    };

    const getPrevBody = () => {
      const getUserArrayToString = users => users.map(getDisplayName).join(", ");

      var from = getDisplayName(this.props.mail.from);
      var date = moment(this.props.mail.date).format("DD/MM/YYYY HH:mm");
      var subject = this.props.mail.subject;

      const to = getUserArrayToString(this.props.mail.to);

      var header =
        "<br>" +
        "<br>" +
        '<p class="row ng-scope"></p>' +
        '<hr class="ng-scope">' +
        '<p class="ng-scope"></p>' +
        '<p class="medium-text ng-scope">' +
        '<span translate="" key="transfer.from"><span class="no-style ng-scope">De : </span></span>' +
        '<em class="ng-binding">' +
        from +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.date"><span class="no-style ng-scope">Date: </span></span>' +
        '<em class="ng-binding">' +
        date +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.subject"><span class="no-style ng-scope">Objet : </span></span>' +
        '<em class="ng-binding">' +
        subject +
        "</em>" +
        "<br>" +
        '<span class="medium-importance" translate="" key="transfer.to"><span class="no-style ng-scope">A : </span></span>' +
        '<em class="medium-importance">' +
        to +
        "</em>";

      if (this.props.mail.cc.length > 0) {
        const cc = getUserArrayToString(this.props.mail.cc);

        header += `<br><span class="medium-importance" translate="" key="transfer.cc">
        <span class="no-style ng-scope">Copie à : </span>
        </span><em class="medium-importance ng-scope">${cc}</em>`;
      }

      header +=
        '</p><blockquote class="ng-scope">' +
        '<p class="ng-scope" style="font-size: 24px; line-height: 24px;">' +
        this.props.mail.body +
        "</p>";

      return header;
    };

    switch (draftType) {
      case DraftType.REPLY: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [this.props.mail.from].map(getUser),
            subject: I18n.t("zimbra-reply-subject") + this.props.mail.subject,
          },
        };
      }
      case DraftType.REPLY_ALL: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            to: [this.props.mail.from, ...this.props.mail.to.filter(user => user !== getSessionInfo().userId)]
              .filter((user, index, array) => array.indexOf(user) === index)
              .map(getUser),
            cc: this.props.mail.cc.filter(id => id !== this.props.mail.from).map(getUser),
            subject: I18n.t("zimbra-reply-subject") + this.props.mail.subject,
          },
        };
      }
      case DraftType.FORWARD: {
        return {
          replyTo: this.props.mail.id,
          prevBody: getPrevBody(),
          mail: {
            subject: I18n.t("zimbra-forward-subject") + this.props.mail.subject,
            body: "",
            attachments: this.props.mail.attachments,
          },
        };
      }
      case DraftType.DRAFT: {
        let prevbody = "";
        if (this.props.mail.body.length > 0) {
          prevbody +=
            "<br><br>" +
            this.props.mail.body
              .split("<br><br>")
              .slice(1)
              .join("<br><br>");
        }
        const current_body = this.props.mail.body.split("<br><br>")[0];

        return {
          prevBody: prevbody,
          mail: {
            to: this.props.mail.to.map(getUser),
            cc: this.props.mail.cc.map(getUser),
            cci: this.props.mail.bcc.map(getUser),
            subject: this.props.mail.subject,
            body: deleteHtmlContent(current_body),
            attachments: this.props.mail.attachments,
          },
        };
      }
    }
  };

  getMailData = () => {
    let { mail, prevBody } = this.state;
    const regexp = /(\r\n|\n|\r)/gm;

    mail.body = mail.body.replace(regexp, "<br>");
    if (prevBody === undefined) {
      prevBody = "";
    }

    return Object.fromEntries(
      Object.entries(mail).map(([key, value]) => {
        if (key === "to" || key === "cc" || key === "bcc") return [key, value.map(user => user.id)];
        else if (key === "body") return [key, value + prevBody];
        else return [key, value];
      })
    );
  };

  getAttachmentData = async (file: LocalFile) => {
    this.setState({ tempAttachment: file });

    try {
      console.log("added new attachment", file);
      const newAttachments = await this.props.addAttachment(this.state.id!, file) as [];
      console.log("getAttachmentData -> newAttachments", newAttachments);
      const formattedNewAttachments = newAttachments.map((att: any)=> {
        console.log("format attachment", att);
        return {
          filename: att.filename,
          filetype: att.contentType,
          id: att.id,
          filesize: att.size,
          url: undefined
        } as IDistantFile;
      });
      this.setState(prevState => ({
        // ToDo recompute all attachments ids here
        mail: { ...prevState.mail, attachments: formattedNewAttachments },
        tempAttachment: null,
      }));
    } catch (e) {
      Toast.show(I18n.t("zimbra-attachment-error"), {
        position: Toast.position.BOTTOM,
      });
      this.setState({ tempAttachment: null });
    }
  };

  forwardDraft = async () => {
    try {
      this.props.forwardMail(this.state.id, this.state.replyTo);
    } catch (e) {
      console.log(e);
    }
  };

  saveDraft = async () => {
    if (this.state.id === undefined) {
      const inReplyTo = this.props.mail.id;
      const isForward = this.props.navigation.getParam("type") === DraftType.FORWARD;
      const idDraft = await this.props.makeDraft(this.getMailData(), inReplyTo, isForward);

      this.setState({ id: idDraft });
      if (isForward) this.forwardDraft();
    } else {
      this.props.updateDraft(this.state.id, this.getMailData());
    }
  };

  public render() {
    const { isPrefilling, mail } = this.state;
    const { attachments, body, ...headers } = mail;
    console.log("NewMail attachments", attachments);

    return (
      <NewMailComponent
        isFetching={this.props.isFetching || !!isPrefilling}
        headers={headers}
        onDraftSave={this.saveDraft}
        onHeaderChange={headers => this.setState(prevState => ({ mail: { ...prevState.mail, ...headers } }))}
        body={this.state.mail.body.replace(/<br>/gs, "\n")}
        onBodyChange={body => this.setState(prevState => ({ mail: { ...prevState.mail, body } }))}
        attachments={
          this.state.tempAttachment
            ? [...this.state.mail.attachments, this.state.tempAttachment]
            : this.state.mail.attachments
        }
        onAttachmentChange={attachments => {
          console.log("onAttachmentChange", attachments);
          return this.setState(prevState => ({ mail: { ...prevState.mail, attachments } }));
        }}
        onAttachmentDelete={attachmentId => this.props.deleteAttachment(this.state.id, attachmentId)}
        prevBody={this.state.prevBody}
      />
    );
  }
}

const mapStateToProps = (state: any) => {
  const { isFetching, data } = getMailContentState(state);

  return {
    mail: data,
    isFetching,
    uploadProgress: [state.progress.value],
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    {
      sendMail: sendMailAction,
      forwardMail: forwardMailAction,
      makeDraft: makeDraftMailAction,
      updateDraft: updateDraftMailAction,
      trashMessage: trashMailsAction,
      onPickFileError: (notifierId: string) => dispatch(pickFileError(notifierId)),
      addAttachment: addAttachmentAction,
      deleteAttachment: deleteAttachmentAction,
      clearContent: clearMailContentAction,
      fetchMailContent: fetchMailContentAction,
    },
    dispatch
  );
};

export default withViewTracking("zimbra/NewMessage")(connect(mapStateToProps, mapDispatchToProps)(NewMailContainer));