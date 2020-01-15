import * as React from "react";
import { View, ViewStyle, Platform } from "react-native";
import { connect } from "react-redux";
import I18n from "i18n-js";
import RNFetchBlob from "rn-fetch-blob";
import Filesize from "filesize";
import Mime from "mime";
import Permissions, { PERMISSIONS } from "react-native-permissions";
import Tracking from "../../tracking/TrackingManager";
import { getAuthHeader } from "../../infra/oauth";
import { ModalBox, ModalContent, ModalContentBlock, ModalContentText } from "../../ui/Modal";
import { ButtonsOkCancel } from "../../ui";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { IAttachment } from "../actions/messages";
import Conf from "../../../ode-framework-conf";
import ThreadMessageAttachment, { DownloadState } from "../components/ThreadMessageAttachment";
import getAPIPrefix from "../actions/apiHelper";

class ThreadMessageAttachmentContainer extends React.PureComponent<
  {
    attachment: IAttachment;
    messageId: string;
    highlightColor: string;
    style: ViewStyle;
    url: string;
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
      showModal: false,
    };
  }

  public onPressAttachment() {
    if (this.state.downloadState === DownloadState.Idle) {
      this.setState({ showModal: true });
    } else if (this.state.downloadState === DownloadState.Success) {
      this.openDownloadedFile();
    } else if (this.state.downloadState === DownloadState.Error) {
      this.startDownload();
    }
  }

  private async startDownload() {
    let config: {};

    if (Platform.OS === "android") {
      await Permissions.request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
      config = {
        path: RNFetchBlob.fs.dirs.DownloadDir || RNFetchBlob.fs.dirs.DocumentDir + "/" + this.props.attachment.filename,
      };
    } else if (Platform.OS === "ios") {
      config = {
        path: RNFetchBlob.fs.dirs.DocumentDir + "/" + this.props.attachment.filename,
      };
    } else {
      console.warn("Cannot handle file for devices other than ios/android.");
      return;
    }

    Tracking.logEvent("downloadAttachments");

    this.setState({
      downloadState: DownloadState.Downloading,
      showModal: false,
    });

    RNFetchBlob.config(config)
      .fetch("GET", this.props.url, getAuthHeader()["headers"])
      .progress((received, total) => {
        this.setState({
          progress: received / this.props.attachment.size,
        });
      })
      .then(res => {
        this.setState({
          downloadState: DownloadState.Success,
          localFile: res.path(),
          progress: 1,
        });
      })
      .catch((errorMessage, statusCode) => {
        console.log("Error downloading", statusCode, errorMessage);
        this.setState({
          downloadState: DownloadState.Error,
          progress: 0,
        });
      });
  }

  public openDownloadedFile() {
    if (this.state.localFile) {
      Tracking.logEvent("openAttachments");
      if (Platform.OS === "ios") {
        RNFetchBlob.ios.openDocument(this.state.localFile);
      } else if (Platform.OS === "android") {
        RNFetchBlob.android.actionViewIntent(this.state.localFile, Mime.getType(this.state.localFile));
      } else {
        // tslint:disable-next-line:no-console
        console.warn("Cannot handle file for devices other than ios/android.");
      }
    }
  }

  public renderModal() {
    return (
      <ModalBox backdropOpacity={0.5} isVisible={this.state.showModal}>
        <ModalContent>
          <ModalContentBlock>
            <ModalContentText>
              {I18n.t("download-confirm", {
                name: this.props.attachment.filename,
                size: Filesize(this.props.attachment.size, { round: 1 }),
              })}
            </ModalContentText>
          </ModalContentBlock>
          <ModalContentBlock>
            <ButtonsOkCancel
              onCancel={() => this.setState({ showModal: false })}
              onValid={() => this.startDownload()}
              title={I18n.t("download")}
            />
          </ModalContentBlock>
        </ModalContent>
      </ModalBox>
    );
  }

  public render() {
    return (
      <View style={{ flex: 0 }}>
        <TouchableOpacity
          style={{
            alignItems: "center",
            flex: 0,
            flexDirection: "row",
            ...this.props.style,
          }}
          onPress={() => this.onPressAttachment()}
        >
          <View
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            height: "100%",
            position: "absolute",
            width: this.state.progress * 100 + "%",
          }}
        />
          <ThreadMessageAttachment
            fileName={this.props.attachment.filename}
            downloadState={this.state.downloadState}
            highlightColor={this.props.highlightColor}
          />
        </TouchableOpacity>
        {this.renderModal()}
      </View>
    );
  }
}

const mapStateToProps = (state: any, props: any) => {
  const url = `${Conf.currentPlatform.url}${getAPIPrefix(state)}/message/${props.messageId}/attachment/${
    props.attachment.id
  }`;
  return { url };
};

export default connect(mapStateToProps)(ThreadMessageAttachmentContainer);
