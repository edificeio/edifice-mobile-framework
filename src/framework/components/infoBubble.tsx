import * as React from "react";
import { View, Image, Dimensions, TouchableOpacity, ImageSourcePropType, ViewStyle } from "react-native";
import I18n from "i18n-js";

import { IconButton } from "../../ui/IconButton";
import { getItemJson, setItemJson, removeItemJson } from "~/framework/util/storage";
import theme from "~/framework/util/theme";
import { Card, InfoCard } from "./card";
import { FlatButton } from "../../ui";
import { Text, TextBold } from "./text";
import { Toggle } from "./toggle";

export interface IInfoBubbleProps {
  infoText: string;
  infoBubbleType: "floating" | "regular";
  infoBubbleId: string;
  infoTitle?: string;
  infoImage?: ImageSourcePropType;
  style?: ViewStyle;
};

export interface IInfoBubbleState {
  isAcknowledged: boolean; // determines whether the InfoBubble is displayed
  acknowledgeToggle: boolean; // determines whether the Toggle is ON/OFF (regular type)
  displayToggle: boolean; // determines whether the content is displayed (floating type)
};

const computeStorageId = (infoBubbleId: string) => `infoBubbleAck-${infoBubbleId}`;

export class InfoBubble extends React.PureComponent<IInfoBubbleProps, IInfoBubbleState> {

  // DECLARATIONS =================================================================================
  
  state: IInfoBubbleState = {
    isAcknowledged: true,
    acknowledgeToggle: false,
    displayToggle: false
  }

  // RENDER =======================================================================================

  public render() {
    const { infoBubbleType } = this.props;
    const { isAcknowledged } = this.state;
    const isRegular = infoBubbleType === "regular";
    const isFloating = infoBubbleType === "floating";
    return isAcknowledged
      ? null
      : isRegular ? this.renderRegularInfoBubble()
      : isFloating ? this.renderFloatingInfoBubble()
      : null;
  }

  renderFloatingInfoBubble() {
    const { infoText, infoTitle, infoImage, style } = this.props;
    const { displayToggle } = this.state;
    const textContainerWidth = Dimensions.get("window").width * 0.9;
    const infoBubbleRightMargin = Dimensions.get("window").width * 0.05;
    const infoBubbleDiameter = 38;
    const infoBubbleRadius = infoBubbleDiameter / 2;
    const iconSize = infoBubbleDiameter * 0.7;
    return (
      <Card
        style={[
          {
            width: displayToggle ? textContainerWidth : undefined,
            borderRadius: infoBubbleRadius,
            position: "absolute",
            right: infoBubbleRightMargin,
            bottom: 0,
            paddingHorizontal: undefined,
            paddingVertical: undefined
          },
          style
        ]}
      >
        {displayToggle
          ? <View style={{flex: 1, paddingVertical: 16, paddingHorizontal: 12, alignItems: "center"}}>
              {infoTitle ? <TextBold style={{textAlign: "left", marginBottom: 15}}>{infoTitle}</TextBold> : null}
              {infoImage ? <Image source={infoImage} resizeMode="contain" style={{ height: 120, width: 120, marginBottom: 15 }}/> : null}
              <Text style={{textAlign: "left", marginBottom: 15}}>{infoText}</Text>
              <FlatButton
                title={I18n.t("common.infoBubble-understood")}
                onPress={() => this.doAcknowledge(true)}
              />
            </View>
          : null
        }
        <TouchableOpacity
          onPress={() => this.setState({displayToggle: !displayToggle})}
          style={displayToggle ? {position: "absolute", bottom: 0, right: 0} : undefined}
        >
          <IconButton
            iconName="interrogation-mark"
            iconSize={iconSize}
            buttonStyle={{
              backgroundColor: displayToggle ? theme.color.primary.regular : theme.color.secondary.regular,
              height: infoBubbleDiameter,
              width: infoBubbleDiameter,
              borderRadius: infoBubbleRadius,
            }}
          />
        </TouchableOpacity>
      </Card>
    );
  }

  renderRegularInfoBubble() {
    const { infoText, style } = this.props;
    const { acknowledgeToggle } = this.state;
    return (
      <InfoCard style={style}>
        <Text style={{textAlign: "left", marginBottom: 15}}>{infoText}</Text>
        <View style={{flexDirection: "row", alignSelf: "flex-end", alignItems: "center"}}>
          <Text style={{marginRight: 10, fontSize: 12}}>{I18n.t("common.infoBubble-doNotShow")}</Text>
          <Toggle
            checked={acknowledgeToggle}
            onCheckChange={() => this.doAcknowledge(!acknowledgeToggle)}
          />
        </View>
      </InfoCard> 
    );
  }

  // LIFECYCLE ====================================================================================

  constructor(props: IInfoBubbleProps) {
    super(props);
    this.doVerifyIfAcknowledged();
  }

  // METHODS ======================================================================================

  async doVerifyIfAcknowledged() {
    const { infoBubbleId } = this.props;
    const asyncStorageKey = computeStorageId(infoBubbleId);
    try {
      const res = await getItemJson(asyncStorageKey);
      const isAcknowledged = !!res;
      this.setState({isAcknowledged});
    } catch (e) {
      // ToDo: Error handling
      console.warn("doVerifyIfAcknowledged failed", e);
    }
  }

  async doAcknowledge(acknowledge: boolean) {
    const { infoBubbleId, infoBubbleType } = this.props;
    const asyncStorageKey = computeStorageId(infoBubbleId);
    const isRegular = infoBubbleType === "regular";
    const isFloating = infoBubbleType === "floating";
    try {
      acknowledge
        ? await setItemJson(asyncStorageKey, true)
        : await removeItemJson(asyncStorageKey);
      isFloating
        ? this.setState({isAcknowledged: true})
        : isRegular
        ? this.setState({acknowledgeToggle: acknowledge})
        : null;
    } catch (e) {
      // ToDo: Error handling
      console.warn("doAcknowledge failed", e);
    }
  }
}
