import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { connect } from "react-redux";
import {
  ActivityIndicator,
  Text,
  View,
  ViewStyle,
  Platform
} from "react-native";
import RNFetchBlob from "rn-fetch-blob";
const dirs = RNFetchBlob.fs.dirs;
import Permissions, { PERMISSIONS } from "react-native-permissions";

import { CommonStyles } from "../../styles/common/styles";

import { getAuthHeader } from "../../infra/oauth";

import Filesize from "filesize";
import Mime from "mime";
import Conf from "../../../ode-framework-conf";
import { ButtonsOkCancel, Icon, Loading } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import Tracking from "../../tracking/TrackingManager";
import conversationConfig from "../config"
import { notifierShowAction } from "../../infra/notifier/actions";
import Notifier from "../../infra/notifier/container";

export interface IAttachment {
  id: string;
  name: string;
  charset: string;
  filename: string;
  contentType: string;
  contentTransferEncoding: string;
  size: number; // in Bytes
}

export enum DownloadState {
  Idle = 0,
  Downloading,
  Success,
  Error
}

const attachmentIconsByFileExt: Array<{
  exts: string[];
  icon: string;
}> = [
  {
    exts: ["doc", "docx"],
    icon: "file-word"
  },
  { exts: ["xls", "xlsx"], icon: "file-excel" },
  {
    exts: ["ppt", "pptx"],
    icon: "file-powerpoint"
  },
  {
    exts: ["pdf"],
    icon: "file-pdf"
  },
  {
    exts: ["zip", "rar", "7z"],
    icon: "file-archive"
  },
  {
    exts: ["png", "jpg", "jpeg", ""],
    icon: "picture"
  }
];
const defaultAttachmentIcon = "attached";
const getAttachmentIconByExt = (filename: string) => {
  // from https://stackoverflow.com/a/12900504/6111343
  const ext = filename
    // tslint:disable-next-line:no-bitwise
    .slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
    .toLowerCase();

  let icon: string = defaultAttachmentIcon; // default returned value if no one match
  attachmentIconsByFileExt.map(type => {
    if (type.exts.includes(ext)) icon = type.icon;
  });

  return icon;
};
const openDownloadedFile = (localFile) => {
  return (dispatch) => {
    if (localFile) {
      Tracking.logEvent("openAttachments");
      if (Platform.OS === "ios") {
        RNFetchBlob.ios.openDocument(localFile)
          .catch(error => {
            dispatch(notifierShowAction({
              text: I18n.t(error.message.includes("not supported")
                ? "conversation-attachment-unsupportedFileType"
                : "conversation-attachment-error"
              ),
              type: 'warning'
            }));
          })
      } else if (Platform.OS === "android") {
        RNFetchBlob.android.actionViewIntent(localFile, Mime.getType(localFile))
        // FIXME: implement catch (does not work on android, for now)
          // .catch(error => {
          //   dispatch(notifierShowAction({
          //     text: I18n.t(error.message.includes("not supported")
          //       ? "conversation-attachment-unsupportedFileType"
          //       : "conversation-attachment-error"
          //     ),
          //     type: 'warning'
          //   }));
          // })
      } else {
        // tslint:disable-next-line:no-console
        console.warn("Cannot handle file for devices other than ios/android.");
      }
    }
  }
}

class ThreadMessageAttachment extends React.PureComponent<
  {
    attachment: IAttachment;
    style: ViewStyle;
    isMine: boolean;
    messageId: string;
  },
  {
    downloadState: DownloadState;
    progress: number; // From 0 to 1
    showModal: boolean;
    localFile?: string;
  }
> {
  public constructor(props) {
    super(props);
    this.state = {
      downloadState: DownloadState.Idle,
      progress: 0,
      showModal: false
    };
  }

  public render() {
    const { attachment: att, style, isMine } = this.props;
    return (
      <View style={{ flex: 0 }}>
        <Notifier/>
        <TouchableOpacity
          key={att.id}
          style={{
            alignItems: "center",
            flex: 0,
            flexDirection: "row",
            ...style
          }}
          onPress={() => this.onPressAttachment(att)}
        >
          <View
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              height: "100%",
              position: "absolute",
              width: this.state.progress * 100 + "%"
            }}
          />
          <View style={{ padding: 12, flex: 0, flexDirection: "row" }}>
            {this.state.downloadState === DownloadState.Downloading ? (
              <ActivityIndicator
                size="small"
                color={isMine ? "white" : CommonStyles.textColor}
                style={{ flex: 0, marginRight: 8 }}
              />
            ) : this.state.downloadState === DownloadState.Success ? (
              <Icon
                color={isMine ? "white" : CommonStyles.textColor}
                size={16}
                name={"checked"}
                style={{ flex: 0, marginRight: 8 }}
              />
            ) : this.state.downloadState === DownloadState.Error ? (
              <Icon
                color={CommonStyles.errorColor}
                size={16}
                name={"close"}
                style={{ flex: 0, marginRight: 8 }}
              />
            ) : (
              <Icon
                color={isMine ? "white" : CommonStyles.textColor}
                size={16}
                name={getAttachmentIconByExt(att.filename)}
                style={{ flex: 0, marginRight: 8 }}
              />
            )}
            <Text
              style={{
                color: isMine ? "white" : CommonStyles.textColor,
                flex: 1
              }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {this.state.downloadState === DownloadState.Error ? (
                <Text style={{ color: CommonStyles.errorColor }}>
                  {I18n.t("download-error") + " "}
                </Text>
              ) : null}
              <Text
                style={{
                  textDecorationColor: isMine
                    ? "white"
                    : CommonStyles.textColor,
                  textDecorationLine: "underline",
                  textDecorationStyle: "solid"
                }}
              >
                {att.filename}
              </Text>
            </Text>
            <Text
              style={{
                color: isMine ? "white" : CommonStyles.textColor,
                flex: 0
              }}
            >
              {this.state.downloadState === DownloadState.Success
                ? " " + I18n.t("download-open")
                : this.state.downloadState === DownloadState.Error
                ? " " + I18n.t("tryagain")
                : null}
            </Text>
          </View>
        </TouchableOpacity>
        {this.renderModal()}
      </View>
    );
  }

  public renderModal() {
    const { attachment: att } = this.props;
    return (
      <ModalBox backdropOpacity={0.5} isVisible={this.state.showModal}>
        <ModalContent>
          <ModalContentBlock>
            <ModalContentText>
              {I18n.t("download-confirm", {
                name: att.filename,
                size: Filesize(att.size, { round: 1 })
              })}
            </ModalContentText>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => this.setState({ showModal: false })}
              onValid={() => this.startDownload(att)}
              title={I18n.t("download")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }

  public onPressAttachment(att: IAttachment) {
    if (this.state.downloadState === DownloadState.Idle) {
      this.setState({ showModal: true });
    } else if (this.state.downloadState === DownloadState.Success) {
      this.props.onOpenDownloadedFile(this.state.localFile);
    } else if (this.state.downloadState === DownloadState.Error) {
      this.startDownload(this.props.attachment);
    }
  }

  public async startDownload(att: IAttachment) {
    if (Platform.OS === "android") {
      await Permissions.request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }

    Tracking.logEvent("downloadAttachments");

    this.setState({
      downloadState: DownloadState.Downloading,
      showModal: false
    });

    let fetchPromise;
    if (Platform.OS === "ios") {
      fetchPromise = RNFetchBlob.config({
        path: dirs.DocumentDir + "/" + att.filename
      })
        .fetch(
          "GET",
          `${Conf.currentPlatform.url}${conversationConfig.appInfo.prefix}/message/${
            this.props.messageId
          }/attachment/${this.props.attachment.id}`,
          getAuthHeader()
        )
        .progress((received, total) => {
          this.setState({
            progress: received / att.size
          });
        })
        .then(res => {
          // the temp file path
          this.setState({
            localFile: res.path()
          });
        })
    } else if (Platform.OS === "android") {
      fetchPromise = RNFetchBlob.config({
        fileCache: true
      })
        .fetch(
          "GET",
          `${Conf.currentPlatform.url}${conversationConfig.appInfo.prefix}/message/${
            this.props.messageId
          }/attachment/${this.props.attachment.id}`,
          getAuthHeader()
        )
        .progress((received, total) => {
          this.setState({
            progress: received / att.size
          });
        })
        .then(res => {
          // the temp file path
          const baseDir =
            RNFetchBlob.fs.dirs.DownloadDir || RNFetchBlob.fs.dirs.DocumentDir;
          const path = `${baseDir}/${att.filename}`;
          this.setState({
            localFile: path
          });
          RNFetchBlob.fs.writeFile(path, res.path(), "uri");
        })
    } else {
      // tslint:disable-next-line:no-console
      console.warn("Cannot handle file for devices other than ios/android.");
    }

    fetchPromise && fetchPromise.then(res => {
      this.setState({
        downloadState: DownloadState.Success,
        progress: 1
      });
    })
    .catch((errorMessage, statusCode) => {
      // error handling
      console.log("Error downloading", statusCode, errorMessage);
      this.setState({
        downloadState: DownloadState.Error,
        progress: 0
      });
    });
  }
}

export default connect(
  null,
  dispatch => ({
    onOpenDownloadedFile: (localFile) => dispatch(openDownloadedFile(localFile))
  })
)(ThreadMessageAttachment);
