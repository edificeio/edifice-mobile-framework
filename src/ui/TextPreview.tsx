import I18n from 'i18n-js';
import * as React from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import rnTextSize, { TSMeasureParams, TSMeasureResult } from 'react-native-text-size';

import theme from '~/app/theme';
import { UI_SIZES } from '~/framework/components/constants';
import { CaptionText, SmallText, TextFontStyle, TextSizeStyle } from '~/framework/components/text';

export interface ITextPreviewProps {
  textContent: string;
  textStyle?: object;
  numberOfLines?: number;
  isCollapsable?: boolean;
  onExpand?: () => void;
  expandMessage?: string;
  collapseMessage?: string;
  expansionTextStyle?: object;
  additionalText?: JSX.Element;
}

interface ITextPreviewState {
  longText: boolean;
  isExpanded: boolean;
}

export class TextPreview extends React.PureComponent<ITextPreviewProps, ITextPreviewState> {
  state = {
    longText: false,
    isExpanded: false,
  };

  static defaultProps = {
    expandMessage: I18n.t('common.readMore'),
    numberOfLines: 5,
    expansionTextStyle: { color: theme.palette.complementary.blue.regular },
    textStyle: { marginTop: UI_SIZES.spacing.tiny },
  };

  public measureText = (numberOfLines: number | undefined) => async (evt: LayoutChangeEvent) => {
    if (numberOfLines) {
      const { textContent } = this.props;
      const result: TSMeasureResult = await rnTextSize.measure({
        ...TextFontStyle.Regular,
        ...TextSizeStyle.Small,
        text: textContent,
        width: evt.nativeEvent.layout.width,
      } as TSMeasureParams);
      result.lineCount > numberOfLines && this.setState({ longText: true });
    }
  };

  public showExpansionLabels() {
    const { textContent, numberOfLines, isCollapsable } = this.props;
    const { longText, isExpanded } = this.state;
    return !numberOfLines ? textContent.endsWith('...') : longText && (isCollapsable || !isExpanded);
  }

  public renderExpansionLabels() {
    const {
      numberOfLines, // don't include "numberOfLines" prop when "textContent" is already cropped (HTML)
      onExpand, // must include if no "numberOfLines" prop (no expansion possible)
      expandMessage,
      collapseMessage,
      expansionTextStyle,
    } = this.props;
    const { isExpanded } = this.state;
    const expand = expandMessage || I18n.t('seeMore');
    const collapse = collapseMessage || I18n.t('seeLess');
    return (
      this.showExpansionLabels() && (
        <CaptionText
          style={expansionTextStyle}
          onPress={() => (onExpand ? onExpand() : this.setState({ isExpanded: !isExpanded }))}>
          {!numberOfLines && ' '}
          {isExpanded ? collapse : expand}
        </CaptionText>
      )
    );
  }

  public render() {
    const { textContent, textStyle, numberOfLines, additionalText } = this.props;
    const { isExpanded } = this.state;
    return (
      <View>
        <CaptionText
          style={textStyle}
          numberOfLines={!numberOfLines || isExpanded ? undefined : numberOfLines}
          onLayout={this.measureText(numberOfLines)}>
          {textContent}
          {additionalText && !this.showExpansionLabels() && (
            <>
              <SmallText> </SmallText>
              {additionalText}
            </>
          )}
          {!numberOfLines && this.renderExpansionLabels()}
        </CaptionText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {additionalText && this.showExpansionLabels() && (
            <>
              {additionalText}
              <SmallText> </SmallText>
            </>
          )}
          {numberOfLines && this.renderExpansionLabels()}
        </View>
      </View>
    );
  }
}
