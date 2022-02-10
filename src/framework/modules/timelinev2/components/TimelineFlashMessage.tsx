import I18n from 'i18n-js';
import * as React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { TouchableContentCard } from '~/framework/components/card';
import { remlh } from '~/framework/components/text';
import { IEntcoreFlashMessage } from '~/framework/modules/timelinev2/reducer/flashMessages';
import { ArticleContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';
import { Icon } from '~/ui/icons/Icon';

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
    isExtended: false,
  };

  public render() {
    const { flashMessage, flashMessageAction } = this.props;
    const { isExtended, longText, measuredText } = this.state;
    const color = flashMessage && flashMessage.color;
    const customColor = flashMessage && flashMessage.customColor;
    const signature = flashMessage && flashMessage.signature;
    const signatureColor = flashMessage && flashMessage.signatureColor;
    const contents = flashMessage && flashMessage.contents;
    const appLanguage = I18n.currentLocale();
    const contentsHasAppLanguage = contents && contents.hasOwnProperty(appLanguage);
    const contentsLanguages = contents && Object.keys(contents);
    const flashMessageHtml = contentsHasAppLanguage ? contents[appLanguage] : contents && contents[contentsLanguages[0]];
    const maxLines = 4,
      maxHeight = remlh(maxLines);

    return contents && contentsLanguages.length > 0 ? (
      <ArticleContainer style={{ width: '100%', opacity: measuredText ? 1 : 0 }}>
        <TouchableContentCard
          activeOpacity={1}
          onPress={() => {
            this.setState({ isExtended: true });
          }}
          headerIndicator={
            <TouchableOpacity onPress={this.props.flashMessageAction}>
              <Icon name="close" color={theme.color.text.inverse} style={{ paddingVertical: 5, paddingLeft: 8, marginRight: -3 }} />
            </TouchableOpacity>
          }
          style={{
            backgroundColor: color ? theme.flashMessages[color] : customColor || theme.color.primary.regular,
          }}
          header={
            <View
              style={
                isExtended
                  ? {}
                  : longText
                  ? {
                      maxHeight: remlh(4 + 1),
                      overflow: 'hidden',
                    }
                  : {}
              }>
              <HtmlContentView
                html={flashMessageHtml}
                opts={{
                  globalTextStyle: {
                    color: theme.color.text.inverse,
                  },
                  boldTextStyle: {
                    color: theme.color.text.inverse
                  },
                  textColor: false,
                  images: false,
                  iframes: false,
                  audio: false,
                  video: false,
                }}
                onLayout={e => {
                  if (!measuredText) {
                    const flashMessageHeight = e.nativeEvent.layout.height;
                    const longText = flashMessageHeight >= maxHeight;
                    this.setState({ longText, measuredText: true });
                  }
                }}
              />

              {signature ? <Text style={{ fontStyle: 'italic', color: signatureColor }}>{signature}</Text> : null}
            </View>
          }>
          {longText && !isExtended ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Text
                style={{
                  fontWeight: 'bold',
                  color: theme.color.text.inverse,
                }}>
                {I18n.t('seeMore')}
              </Text>
              <Icon name="arrow_down" color={theme.color.text.inverse} style={{ marginLeft: 10, marginRight: -3, paddingTop: 2 }} />
            </View>
          ) : null}
        </TouchableContentCard>
      </ArticleContainer>
    ) : null;
  }
}
