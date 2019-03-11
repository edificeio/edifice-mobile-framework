import style from "glamorous-native";
import I18n from "i18n-js";
import * as React from "react";
import { Text, View, ViewStyle, ActivityIndicator } from "react-native";

import { CommonStyles } from "../../styles/common/styles";

import { adaptator } from "../../infra/HTMLAdaptator";
import { Me } from "../../infra/Me";
import { signUrl } from "../../infra/oauth";

import { SingleAvatar } from "../../ui/avatars/SingleAvatar";
import TouchableOpacity from "../../ui/CustomTouchableOpacity";
import { DateView } from "../../ui/DateView";
import { HtmlContentView } from "../../ui/HtmlContentView";
import { ConversationMessageStatus } from "../actions/sendMessage";
import { Icon, Loading } from "../../ui";

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
  return "file-word";
};

export default class ThreadMessageAttachment extends React.PureComponent<
  {
    attachment: IAttachment;
    style: ViewStyle;
    isMine: boolean;
  },
  {
    downloadState: DownloadState;
    progress: number; // From 0 to 1
  }
> {
  public constructor(props) {
    super(props);
    this.state = {
      downloadState: DownloadState.Idle,
      progress: 0.9
    };
  }

  public render() {
    const { attachment: att, style, isMine } = this.props;
    return (
      <View
        key={att.id}
        style={{
          alignItems: "center",
          flex: 0,
          flexDirection: "row",
          ...style
        }}
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
                {"Erreur." + " "}
              </Text>
            ) : null}
            <Text
              style={{
                textDecorationColor: isMine ? "white" : CommonStyles.textColor,
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
              ? " " + "Ouvrir"
              : this.state.downloadState === DownloadState.Error
              ? " " + "Recommencer"
              : null}
          </Text>
        </View>
      </View>
    );
  }
}
