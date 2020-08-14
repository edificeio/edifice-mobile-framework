import * as React from "react";
import { View, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import { TouchableOpacity as RNGHTouchableOpacity } from "react-native-gesture-handler";
import I18n from "i18n-js";
import { BubbleStyle } from "./BubbleStyle";
import { Bold, A } from "./Typography";
import { Icon } from ".";
import { CommonStyles } from "../styles/common/styles";
import Attachment, { IRemoteAttachment } from "./Attachment";

export class AttachmentGroup extends React.PureComponent<
  {
    attachments: Array<IRemoteAttachment>;
    containerStyle?: any;
    editMode?: boolean;
    isContainerHalfScreen?: boolean;
    attachmentsHeightHalfScreen?: number;
    onRemove?: (index: number) => void;
    onDownload?: () => void;
    onError?: () => void;
    onOpen?: () => void;
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
    const { 
      attachments,editMode,
      containerStyle,
      isContainerHalfScreen,
      attachmentsHeightHalfScreen,
      onRemove,
      onDownload,
      onDownloadAll,
      onError,
      onOpen
    } = this.props;
    const { downloadAll } = this.state;
    return (
      <TouchableOpacity activeOpacity={1} style={containerStyle}>
        {editMode
          ? null
          : <BubbleStyle
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
              ? <RNGHTouchableOpacity
                  onPress={() => {
                    this.setState({ downloadAll: true });
                    onDownloadAll && onDownloadAll();
                  }}
                >
                  <A style={{ fontSize: 12 }}>{I18n.t("download-all")}</A>
              </RNGHTouchableOpacity>
              : null
              }
            </BubbleStyle>
        }
        <BubbleStyle
          style={{
            flex: 0,
            paddingVertical: 2,
            marginTop: 0,
            marginBottom: 0,
          }}
        ><SafeAreaView>
          <FlatList
            style={{flex: 0, maxHeight: isContainerHalfScreen ? attachmentsHeightHalfScreen : undefined}} // TODO: refactor (use flex/height, instead of props)
            data={attachments}
            renderItem={({ item, index }) => 
              <Attachment
                key={index}
                attachment={item}
                starDownload={downloadAll}
                onDownload={onDownload}
                onError={onError}
                onOpen={onOpen}
                style={{marginTop: index === 0 ? 0 : 2}}
                editMode={editMode && !item.hasOwnProperty("id")}
                onRemove={() => onRemove && onRemove(index)}
              />
            }
          />
          </SafeAreaView>
        </BubbleStyle>
      </TouchableOpacity>
    )
  }
}
