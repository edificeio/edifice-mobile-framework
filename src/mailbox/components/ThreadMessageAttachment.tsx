import * as React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import I18n from "i18n-js";
import { Icon } from "../../ui";

import { CommonStyles } from "../../styles/common/styles";

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

export enum DownloadState {
  Idle = 0,
  Downloading,
  Success,
  Error,
}

export default class ThreadMessageAttachment extends React.PureComponent<{
  highlightColor: string;
  downloadState: DownloadState;
  fileName: string;
}> {
  private renderIcon() {
    switch (this.props.downloadState) {
      case DownloadState.Downloading: {
        return <ActivityIndicator size="small" color={this.props.highlightColor} style={{ flex: 0, marginRight: 8 }} />;
      }
      case DownloadState.Error: {
        return <Icon color={CommonStyles.errorColor} size={16} name={"close"} style={{ flex: 0, marginRight: 8 }} />;
      }

      case DownloadState.Success: {
        return (
          <Icon color={this.props.highlightColor} size={16} name={"checked"} style={{ flex: 0, marginRight: 8 }} />
        );
      }
      default: {
        return (
          <Icon
            color={this.props.highlightColor}
            size={16}
            name={getAttachmentIconByExt(this.props.fileName)}
            style={{ flex: 0, marginRight: 8 }}
          />
        );
      }
    }
  }

  public render() {
    return (
      <View style={{ padding: 12, flex: 1, flexDirection: "row" }}>
        {this.renderIcon()}
        <Text
          style={{
            color: this.props.highlightColor,
            flex: 1,
          }}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          {this.props.downloadState === DownloadState.Error ? (
            <Text style={{ color: CommonStyles.errorColor }}>{I18n.t("download-error") + " "}</Text>
          ) : null}
          <Text
            style={{
              textDecorationColor: this.props.highlightColor,
              textDecorationLine: "underline",
              textDecorationStyle: "solid",
            }}
          >
            {this.props.fileName}
          </Text>
        </Text>
        <Text
          style={{
            color: this.props.highlightColor,
            flex: 0,
          }}
        >
          {this.props.downloadState === DownloadState.Success
            ? " " + I18n.t("download-open")
            : this.props.downloadState === DownloadState.Error
            ? " " + I18n.t("tryagain")
            : null}
        </Text>
      </View>
    );
  }
}
