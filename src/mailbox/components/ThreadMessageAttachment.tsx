import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import {
  ActivityIndicator,
  Text,
  View,
  ViewStyle,
  Platform
} from "react-native";
import RNFetchBlob from "rn-fetch-blob";
const dirs = RNFetchBlob.fs.dirs;
import Permissions from "react-native-permissions";

import { CommonStyles } from "../../styles/common/styles";

import { DEPRECATED_signImageURISource, getDummySignedRequest } from "../../infra/oauth";

import Filesize from "filesize";
import Mime from "mime";
import Conf from "../../../ode-framework-conf";
import { ButtonsOkCancel, Icon, Loading } from "../../ui";
import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { DateView } from "../../ui/DateView";
import { HtmlContentView } from "../../ui/HtmlContentView";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "../../ui/Modal";
import { LightP } from "../../ui/Typography";
import { ConversationMessageStatus } from "../actions/sendMessage";
import Tracking from "../../tracking/TrackingManager";

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

export default class ThreadMessageAttachment extends React.PureComponent<
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
    // console.log("attachment :", att);
    // console.log("attstate", this.state);

    if (this.state.downloadState === DownloadState.Idle) {
      this.setState({ showModal: true });
    } else if (this.state.downloadState === DownloadState.Success) {
      this.openDownloadedFile();
    } else if (this.state.downloadState === DownloadState.Error) {
      this.startDownload(this.props.attachment);
    }
  }

  public async startDownload(att: IAttachment) {
    // console.log("start download");
    // console.log(Permissions);
    if (Platform.OS === "android") {
      await Permissions.request("storage");
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
          `${Conf.currentPlatform.url}/conversation/message/${
            this.props.messageId
          }/attachment/${this.props.attachment.id}`,
          getDummySignedRequest()["headers"]
        )
        .progress((received, total) => {
          // console.log("progress", received, att.size);
          this.setState({
            progress: received / att.size
          });
        })
        .then(res => {
          // the temp file path
          // console.log("The file saved to ", res.path());
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
          `${Conf.currentPlatform.url}/conversation/message/${
            this.props.messageId
          }/attachment/${this.props.attachment.id}`,
          getDummySignedRequest()["headers"]
        )
        .progress((received, total) => {
          // console.log("progress", received, att.size);
          this.setState({
            progress: received / att.size
          });
        })
        .then(res => {
          // the temp file path
          // console.log("The file saved to ", res.path());
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

  public openDownloadedFile() {
    if (this.state.localFile) {
      Tracking.logEvent("openAttachments");
      if (Platform.OS === "ios") {
        RNFetchBlob.ios.openDocument(this.state.localFile);
      } else if (Platform.OS === "android") {
        // console.log("TODO open file on android", this.state.localFile);
        // console.log(Mime, Mime.getType(this.state.localFile));
        RNFetchBlob.android.actionViewIntent(
          this.state.localFile,
          Mime.getType(this.state.localFile)
        );
      } else {
        // tslint:disable-next-line:no-console
        console.warn("Cannot handle file for devices other than ios/android.");
      }
    }
  }
}
