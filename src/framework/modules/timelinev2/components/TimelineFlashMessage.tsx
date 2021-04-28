import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import I18n from "i18n-js";

import { CommonStyles } from "../../../../styles/common/styles";
import { TouchCard } from "../../../../ui/Card";
import { ArticleContainer } from "../../../../ui/ContainerContent";
import { Icon } from "../../../../ui/icons/Icon";
// import { ITimelineFlashMessageModel } from "../reducer";
import { HtmlContentView } from "../../../../ui/HtmlContentView";

// interface ITimelineFlashMessageProps extends ITimelineFlashMessageModel {
//   onPress?: () => void;
// }
// TODO: fix import
interface ITimelineFlashMessageProps {
  onPress?: () => void;
}

interface ITimelineFlashMessageState {
  longText: boolean;
  measuredText: boolean;
  isExtended: boolean;
}

export class TimelineFlashMessage extends React.PureComponent<ITimelineFlashMessageProps, ITimelineFlashMessageState> {
  state = {
    longText: false,
    measuredText: false,
    isExtended: false
  };

  dismiss() {
    const { onPress } = this.props;
    onPress && onPress();
  }

  public render() {
    const { contents } = this.props;
    const { isExtended, longText, measuredText } = this.state;
    const appLanguage = I18n.currentLocale();
    const contentsHasAppLanguage = contents && contents.hasOwnProperty(appLanguage);
    const contentsLanguages = contents && Object.keys(contents);
    const flashMessageHtml = contentsHasAppLanguage ? contents[appLanguage] : contents && contents[contentsLanguages[0]];

    return contents && contentsLanguages.length > 0
      ? <ArticleContainer style={{ width: "100%", opacity: measuredText ? 1 : 0 }}>
          <TouchCard
            activeOpacity={1}
            onLayout={e => {
              if (!measuredText) {
                const flashMessageHeight = e.nativeEvent.layout.height;
                const longText = flashMessageHeight >= 164;
                this.setState({ longText, measuredText: true });
              }
            }}
            style={{ 
              width: "100%",
              overflow: "hidden",
              position: measuredText ? "relative" : "absolute",
              backgroundColor: CommonStyles.secondary,
            }}
          >
            <HtmlContentView
              key={`${longText && !isExtended}`}
              html={flashMessageHtml}
              opts={{
                globalTextStyle: {color: "#FFFFFF", paddingRight: 10, height: longText && !isExtended ? 120 : undefined},
                textColor: false,
                images: false,
                iframes: false,
                audio: false,
                video: false,
              }}
            />
            <View style={{position: "absolute", right: 6, top: 6}}>
              <TouchableOpacity onPress={() => this.dismiss()}>
                <Icon size={16} color="#ffffff" name="close" />
              </TouchableOpacity>
            </View>
            {longText && !isExtended
              ? <TouchableOpacity
                  style={{ alignSelf: "flex-end", marginRight: 6 }}
                  onPress={() => this.setState({isExtended: true})}
                >
                  <Text
                    style={{ 
                      color: "#FFF",
                      textDecorationLine: "underline",
                      fontWeight: "bold",
                      fontStyle: "italic"
                    }}
                  >
                    {I18n.t("seeMore")}
                  </Text>
                </TouchableOpacity>
              : null
            }
          </TouchCard>
        </ArticleContainer>
      : null
  }
}
