import I18n from 'i18n-js';
import * as React from 'react';
import { TouchableOpacity, View } from 'react-native';

import theme from '~/app/theme';
import { TouchableContentCard } from '~/framework/components/card';
import { UI_SIZES, getScaleHeight } from '~/framework/components/constants';
import { Icon } from '~/framework/components/picture/Icon';
import { SmallBoldText, SmallItalicText } from '~/framework/components/text';
import { IEntcoreFlashMessage } from '~/framework/modules/timelinev2/reducer/flashMessages';
import { ArticleContainer } from '~/ui/ContainerContent';
import { HtmlContentView } from '~/ui/HtmlContentView';

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
      maxHeight = getScaleHeight(20) * maxLines;

    return contents && contentsLanguages.length > 0 ? (
      <ArticleContainer style={{ width: '100%', opacity: measuredText ? 1 : 0 }}>
        <TouchableContentCard
          activeOpacity={1}
          onPress={() => {
            this.setState({ isExtended: true });
          }}
          headerIndicator={
            <TouchableOpacity onPress={flashMessageAction}>
              <Icon
                name="close"
                color={theme.ui.text.inverse}
                style={{
                  paddingVertical: UI_SIZES.spacing.tiny,
                  paddingLeft: UI_SIZES.spacing.minor,
                }}
              />
            </TouchableOpacity>
          }
          style={{
            backgroundColor: color ? theme.palette.flashMessages[color] : customColor || theme.palette.secondary.regular,
          }}
          header={
            <View
              style={
                isExtended
                  ? {}
                  : longText
                  ? {
                      maxHeight: getScaleHeight(20) * (4 + 1),
                      overflow: 'hidden',
                    }
                  : {}
              }>
              <HtmlContentView
                html={flashMessageHtml}
                opts={{
                  globalTextStyle: {
                    color: theme.ui.text.inverse,
                  },
                  boldTextStyle: {
                    color: theme.ui.text.inverse,
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

              {signature ? <SmallItalicText style={{ color: signatureColor }}>{signature}</SmallItalicText> : null}
            </View>
          }>
          {longText && !isExtended ? (
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
              <SmallBoldText style={{ color: theme.ui.text.inverse }}>{I18n.t('seeMore')}</SmallBoldText>
              <Icon
                name="arrow_down"
                color={theme.ui.text.inverse}
                style={{
                  marginLeft: UI_SIZES.spacing.minor,
                  paddingTop: UI_SIZES.spacing.tiny,
                }}
              />
            </View>
          ) : null}
        </TouchableContentCard>
      </ArticleContainer>
    ) : null;
  }
}
