import * as React from "react";
import { View, Text, Image, Dimensions, TouchableOpacity } from "react-native";

import { CommonStyles } from "../styles/common/styles"
import { IconButton } from "./IconButton";

export class InfoBubble extends React.PureComponent<{infoText: string, infoTitle?: string, infoImage?: any}, {showInfos: boolean}> {
  public state={
    showInfos: false
  }

  public render() {
    const { showInfos } = this.state;
    const { infoText, infoTitle, infoImage } = this.props;
    const textContainerWidth = Dimensions.get("window").width * 0.9;
    const infoBubbleRightMargin = Dimensions.get("window").width * 0.05;
    const infoBubbleDiameter = 38;
    const infoBubbleRadius = infoBubbleDiameter / 2;
    const iconSize = infoBubbleDiameter * 0.7;

    return (
      <View
        style={{
          backgroundColor: CommonStyles.white,
          width: showInfos ? textContainerWidth : undefined,
          borderRadius: infoBubbleRadius,
          position: "absolute",
          right: infoBubbleRightMargin,
          bottom: 0,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 3.8
        }}
      >
        {showInfos
          ? <View style={{flex: 1, paddingVertical: 30, paddingHorizontal: 30, alignItems: "center"}}>
              {infoTitle ? <Text style={{textAlign: "left", fontWeight: "bold", marginBottom: 15}}>{infoTitle}</Text> : null}
              {infoImage ? <Image source={infoImage} style={{ height: 120, width: 120, marginBottom: 15 }} resizeMode="contain"/> : null}
              <Text style={{textAlign: "left"}}>{infoText}</Text>
            </View>
          : null
        }
        <TouchableOpacity
          style={{alignItems: "flex-end"}}
          onPress={() => this.setState({showInfos: !showInfos})}
        >
          <IconButton
            iconName="interrogation-mark"
            iconSize={iconSize}
            buttonStyle={{
              backgroundColor: showInfos ? CommonStyles.secondary : CommonStyles.primary,
              height: infoBubbleDiameter,
              width: infoBubbleDiameter,
              borderRadius: infoBubbleRadius
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
