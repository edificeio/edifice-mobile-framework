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
import RNFetchBlob, { FetchBlobResponse } from "rn-fetch-blob";

import Permissions, { PERMISSIONS } from "react-native-permissions";

import { CommonStyles } from "../styles/common/styles";

import { getAuthHeader } from "../infra/oauth";

import Filesize from "filesize";
import Mime from "mime";
import { ButtonsOkCancel, Icon } from ".";
import TouchableOpacity from "./CustomTouchableOpacity";
import {
  ModalBox,
  ModalContent,
  ModalContentBlock,
  ModalContentText
} from "./Modal";
import { notifierShowAction } from "../infra/notifier/actions";
import Notifier from "../infra/notifier/container";

export interface IAttachment {
  url: string;
  filename?: string;
  displayName?: string;
  id?: string;
  name?: string;
  charset?: string;
  contentType?: string;
  contentTransferEncoding?: string;
  size: number; // in Bytes
}

export enum DownloadState {
  Idle = 0,
  Downloading,
  Success,
  Error
}

const dirs = RNFetchBlob.fs.dirs;
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
    exts: ["png", "jpg", "jpeg"],
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
const openDownloadedFile = (notifierId: string, localFile?: string) => {
  return (dispatch) => {
    if (localFile) {
      if (Platform.OS === "ios") {
        (RNFetchBlob.ios.openDocument(localFile) as unknown as Promise<any>) // TS declaration for RNFetchBlob iOS is incomplete
          .catch(error => {
            dispatch(notifierShowAction({
              id: notifierId,
              text: I18n.t(error.message.includes("not supported")
                ? "download-error-unsupportedFileType"
                : "download-error-generic"
              ),
              type: 'warning'
            }));
          })
      } else if (Platform.OS === "android") {
        RNFetchBlob.android.actionViewIntent(localFile, Mime.getType(localFile) || "text/plain")
        // FIXME: implement catch (does not work on android, for now)
          // .catch(error => {
          //   dispatch(notifierShowAction({
          //     id: notifierId,
          //     text: I18n.t(error.message.includes("not supported")
          //       ? "download-error-unsupportedFileType"
          //       : "download-error-generic"
          //     ),
          //     type: 'warning'
          //   }));
          // })
      } else {
        // tslint:disable-next-line:no-console
        console.warn("Cannot handle file for devices other than ios/android.");
      }
    } else {
      dispatch(notifierShowAction({
        id: notifierId,
        text: I18n.t("download-error-generic"),
        type: 'warning',
      }));
    }
  }
}

class Attachment extends React.PureComponent<
  {
    attachment: IAttachment;
    starDownload: boolean;
    style: ViewStyle;
    onOpenDownloadedFile: (notifierId: string, localFile?: string) => void;
    onDownload?: (att: IAttachment) => void;
    onError?: (att: IAttachment) => void;
    onOpen?: (att: IAttachment) => void;
  },
  {
    downloadState: DownloadState;
    progress: number; // From 0 to 1
    showModal: boolean;
    localFile?: string;
  }
> {
  get attId() { 
    const { attachment } = this.props;
    return attachment.url && attachment.url.split('/').pop();
  }

  public constructor(props) {
    super(props);
    this.state = {
      downloadState: DownloadState.Idle,
      progress: 0,
      showModal: false
    };
  }

  public componentDidUpdate(prevProps: any) {
    const { starDownload, attachment } = this.props
    const { downloadState } = this.state;
    const canDownload = this.attId && downloadState !== DownloadState.Success && downloadState !== DownloadState.Downloading;
    if(prevProps.starDownload !== starDownload){
      canDownload && this.startDownload(attachment);
    }
  }

  public render() {
    const { attachment: att, style } = this.props;
    const { downloadState, progress } = this.state;
    const notifierId = `attachment/${this.attId}`;

    return (
      <View style={{ flex: 0 }}>
        <Notifier id={notifierId} />
        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 0,
            flexDirection: "row",
            ...style
          }}
          onPress={() => this.onPressAttachment(notifierId)}
        >
          <View
            style={{
              backgroundColor: CommonStyles.primaryLight,
              height: "100%",
              position: "absolute",
              width: downloadState === DownloadState.Success ? 0 : `${progress * 100}%`
            }}
          />
          <View style={{ padding: 12, flex: 0, flexDirection: "row" }}>
            {downloadState === DownloadState.Downloading ? (
              <ActivityIndicator
                size="small"
                color={CommonStyles.primary}
                style={{ flex: 0, marginRight: 4, height: 18 }}
              />
            ) : downloadState === DownloadState.Success ? (
              <Icon
                color={CommonStyles.themeOpenEnt.green}
                size={16}
                name={"checked"}
                style={{ flex: 0, marginRight: 8 }}
              />
            ) : !this.attId || downloadState === DownloadState.Error ? (
              <Icon
                color={CommonStyles.errorColor}
                size={16}
                name={"close"}
                style={{ flex: 0, marginRight: 8 }}
              />
            ) :
              <Icon
                color={CommonStyles.textColor}
                size={16}
                name={getAttachmentIconByExt(att.filename || att.displayName || "")}
                style={{ flex: 0, marginRight: 8 }}
              />
            }
            <Text
              style={{
                color: CommonStyles.textColor,
                flex: 1
              }}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {downloadState === DownloadState.Error ? (
                <Text style={{ color: CommonStyles.errorColor }}>
                  {I18n.t("download-error") + " "}
                </Text>
              ) : null}
              <Text
                style={{
                  textDecorationColor: downloadState === DownloadState.Success ? CommonStyles.textColor : CommonStyles.lightTextColor,
                  color: downloadState === DownloadState.Success ? CommonStyles.textColor : CommonStyles.lightTextColor,
                  textDecorationLine: "underline",
                  textDecorationStyle: "solid"
                }}
              >
                {att.filename || att.displayName || I18n.t("download-untitled")} {!this.attId && I18n.t("download-invalidUrl")}
              </Text>
            </Text>
            <Text
              style={{
                color: CommonStyles.lightTextColor,
                flex: 0
              }}
            >
              {downloadState === DownloadState.Success
                ? " " + I18n.t("download-open")
                : downloadState === DownloadState.Error
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
    const { showModal } = this.state;

    return (
      <ModalBox backdropOpacity={0.5} isVisible={showModal}>
        <ModalContent>
          <ModalContentBlock>
            <ModalContentText>
              {I18n.t("download-confirm", {
                name: att.filename || att.displayName || I18n.t("download-untitled"),
                size: att.size ? ` (${Filesize(att.size, { round: 1 })})` : ""
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

  public onPressAttachment(notifierId: string) {
    const { onOpenDownloadedFile, attachment } = this.props;
    const { downloadState, localFile } = this.state;

    if(!this.attId) {
      return undefined
    } else if (downloadState === DownloadState.Idle) {
      this.setState({ showModal: true });
    } else if (downloadState === DownloadState.Success) {
      onOpenDownloadedFile(notifierId, localFile);
      this.props.onOpen && this.props.onOpen(attachment);
    } else if (downloadState === DownloadState.Error) {
      this.startDownload(attachment);
    }
  }

  public getOriginalName(res:FetchBlobResponse, att:IAttachment) {
    const resHeaders = res.info().headers;
    const attachmentId = this.attId;

    if (att.filename) {
      return att.filename;
    } else {
      return resHeaders['Content-Disposition']
      ? (resHeaders['Content-Disposition'] as string).replace(/.*filename="(.*)"/, '$1')
      : resHeaders['Content-Type']
      ? `${attachmentId}.${Mime.getExtension((resHeaders['Content-Type'] as string))}`
      : undefined;
    }
  }

  public async startDownload(att: IAttachment) {
    if (Platform.OS === "android") {
      await Permissions.request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    }

    this.setState({
      downloadState: DownloadState.Downloading,
      showModal: false
    });

    let fetchPromise;

    if (Platform.OS !== "ios" && Platform.OS !== "android") {
      // tslint:disable-next-line:no-console
      console.warn("Cannot handle file for devices other than ios/android.");
    } else {
      fetchPromise = RNFetchBlob.config({
        fileCache: true
      })
        .fetch(
          "GET",
          att.url,
          getAuthHeader()
        )
        .progress((received, total) => {
          const fileSize = att.size || total;
          this.setState({
            progress: received / fileSize
          });
          // TODO: wait for RNFetchBlob tu accept this PR (https://github.com/joltup/rn-fetch-blob/pull/558),
          // which solves an issue (https://github.com/joltup/rn-fetch-blob/issues/275) that prevents several
          // progress bars from being displayed in parallel (iOs-only)
        })
        .then(res => {
          // the temp file path
          const originalName = this.getOriginalName(res, att);
          const formattedOriginalName = originalName && originalName.replace(/\//g, "_");
          const baseDir = Platform.OS === "android" ? dirs.DownloadDir || dirs.DocumentDir : dirs.DocumentDir;
          const newpath = `${baseDir}/${formattedOriginalName}`;
          if (!originalName) throw new Error("file can't be saved (unknown name and extension)");

          RNFetchBlob.fs.exists(newpath)
            .then(exists => {
              exists
              ? RNFetchBlob.fs.unlink(newpath)
                  .then(() => RNFetchBlob.fs.mv(res.path(), newpath))
                  .then(() => this.setState({ localFile: newpath }))
                  .catch((errorMessage) => console.log(errorMessage))
              : RNFetchBlob.fs.mv(res.path(), newpath)
                  .then(() => this.setState({ localFile: newpath }))
                  .catch((errorMessage) => console.log(errorMessage))
            })

          this.props.onDownload && this.props.onDownload(att);
        })
        .catch(errorMessage => {
          // error handling 
          console.log(errorMessage);
          this.props.onError && this.props.onError(att);
        })
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
    onOpenDownloadedFile: (notifierId, localFile) => dispatch(openDownloadedFile(notifierId, localFile))
  })
)(Attachment);
