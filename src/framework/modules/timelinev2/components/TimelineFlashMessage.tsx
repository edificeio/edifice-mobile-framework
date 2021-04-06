import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import I18n from "i18n-js";

import { TouchCard } from "../../../../ui/Card";
import { ArticleContainer } from "../../../../ui/ContainerContent";
import { Icon } from "../../../../ui/icons/Icon";
import { IEntcoreFlashMessage } from "../reducer/flashMessages";
import { HtmlContentView } from "../../../../ui/HtmlContentView";
import theme from "../../../theme";

interface ITimelineFlashMessageProps {
  flashMessage: IEntcoreFlashMessage;
  flashMessageAction: () => void;
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

  public render() {
    const { flashMessage, flashMessageAction } = this.props;
    const { isExtended, longText, measuredText } = this.state;
    const contents = flashMessage && flashMessage.contents;
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
              backgroundColor: theme.color.primary.regular,
            }}
          >
            <HtmlContentView
              key={`${longText && !isExtended}`}
              html={flashMessageHtml}
              opts={{
                globalTextStyle: {color: theme.color.cardBackground, paddingRight: 10, height: longText && !isExtended ? 120 : undefined},
                textColor: false,
                images: false,
                iframes: false,
                audio: false,
                video: false,
              }}
            />
            <TouchableOpacity
              style={{position: "absolute", right: 10, top: 10}}
              onPress={flashMessageAction}
            >
              <Icon color={theme.color.cardBackground} name="close" />
            </TouchableOpacity>
            {longText && !isExtended
              ? <TouchableOpacity
                  style={{ alignSelf: "flex-end", marginRight: 6 }}
                  onPress={() => this.setState({isExtended: true})}
                >
                  <Text
                    style={{ 
                      color: theme.color.cardBackground,
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
