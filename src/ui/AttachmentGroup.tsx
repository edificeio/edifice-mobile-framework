import * as React from "react";
import { View, TouchableOpacity } from "react-native";
import I18n from "i18n-js";
import { BubbleStyle } from "./BubbleStyle";
import { Bold, A } from "./Typography";
import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles";
import Attachment, { IAttachment } from "./Attachment";

export class AttachmentGroup extends React.PureComponent<
  {
    attachments: Array<IAttachment>;
    containerStyle?: any;
    onDownload?: (att: IAttachment) => void;
    onError?: (att: IAttachment) => void;
    onOpen?: (att: IAttachment) => void;
    onDownloadAll?: () => void;
  },
  {
    downloadAll: boolean;
  }
> {
  public constructor(props) {
    super(props);
    this.state = {
      downloadAll: false
    };
  }

  public render() {
    const { attachments, containerStyle } = this.props;
    const { downloadAll } = this.state;

    return (
      <View style={containerStyle}>
        <BubbleStyle
          style={{
            flex: 1,
            marginTop: 0,
            marginBottom: 0,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row" }}>
            <Bold style={{ marginRight: 5 }}>
              {I18n.t(`attachment${attachments.length > 1 ? "s" : ""}`)}
            </Bold>
            <Icon
              color={CommonStyles.textColor}
              size={16}
              name={"attached"}
              style={{ flex: 0, marginRight: 8, transform: [{ rotate: "270deg" }] }}
            />
          </View>
          {attachments.length > 1
          ? <TouchableOpacity
              onPress={() => {
                this.setState({ downloadAll: true })
                this.props.onDownloadAll && this.props.onDownloadAll()
              }}
            >
              <A style={{ fontSize: 12 }}>{I18n.t("download-all")}</A>
            </TouchableOpacity>
          : null
          }
        </BubbleStyle>
        <BubbleStyle
          style={{
            flex: 1,
            paddingVertical: 2,
            marginTop: 0,
            marginBottom: 0,
          }}
        >
          {attachments.map((att, index) => (
            <Attachment
              key={index}
              attachment={att}
              starDownload={downloadAll}
              onDownload={this.props.onDownload}
              onError={this.props.onError}
              onOpen={this.props.onOpen}
              style={{ marginTop: index === 0 ? 0 : 2 }}
            />
          ))}
        </BubbleStyle>
      </View>
    )
  }
}
