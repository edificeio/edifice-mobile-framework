import React from 'react';
import { Animated, LayoutChangeEvent, PixelRatio, TouchableOpacity, useAnimatedValue, View, ViewProps } from 'react-native';

import RNTextSize, { TSFontSpecs } from 'react-native-text-size';

import { CARD_EXPANDED_MARGIN_BOTTOM, CARD_EXPANDED_MARGIN_TOP, CARD_UNEXPANDED_MARGIN_TOP, styles } from './styles';
import { ExpandButtonProps, ResourceDescriptionProps } from './types';

import { I18n } from '~/app/i18n';
import theme from '~/app/theme';
import { UI_ANIMATIONS, UI_SIZES } from '~/framework/components/constants';
import { Svg } from '~/framework/components/picture';
import { BodyText, SmallBoldText, TextFontStyle, TextSizeStyle } from '~/framework/components/text';

const MIN_NUMBER_OF_LINES = 3;
const ANIMATION_CONFIG = UI_ANIMATIONS.size;
const TEXT_FONT_SPECS = {
  fontFamily: TextFontStyle.Regular.fontFamily,
  fontStyle: TextFontStyle.Regular.fontStyle,
  fontWeight: TextFontStyle.Regular.fontWeight as TSFontSpecs['fontWeight'],
  ...TextSizeStyle.Medium,
};

const ExpandButton: React.FC<ExpandButtonProps> = ({ isExpanded, onButtonLayout }) => {
  const expandButtonStyle = React.useMemo(() => {
    return isExpanded ? styles.expandedButton : styles.unexpandedButton;
  }, [isExpanded]);

  const onExpandButtonLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      const { height } = event.nativeEvent.layout;
      onButtonLayout(height);
    },
    [onButtonLayout],
  );

  return (
    <View style={expandButtonStyle} onLayout={onExpandButtonLayout}>
      {isExpanded ? (
        <>
          <SmallBoldText style={styles.expandButtonText}>{I18n.get('textpreview-seeless')}</SmallBoldText>
          <Svg
            name={'ui-rafterUp'}
            width={UI_SIZES.elements.icon.xsmall}
            height={UI_SIZES.elements.icon.xsmall}
            fill={theme.palette.grey.graphite}
          />
        </>
      ) : (
        <>
          <SmallBoldText style={styles.expandButtonText}>{I18n.get('textpreview-seemore')}</SmallBoldText>
          <Svg
            name={'ui-rafterDown'}
            width={UI_SIZES.elements.icon.xsmall}
            height={UI_SIZES.elements.icon.xsmall}
            fill={theme.palette.grey.graphite}
          />
        </>
      )}
    </View>
  );
};

const ResourceDescription: React.FC<ResourceDescriptionProps> = ({
  content = '',
  expanded = false,
  numberOfLines: minNumberOfLines = MIN_NUMBER_OF_LINES,
  onToggleVisibility,
  textWidth,
}: ResourceDescriptionProps) => {
  // values used directly in animation calculations
  const animatedMarginTop = useAnimatedValue(CARD_UNEXPANDED_MARGIN_TOP);
  const animatedMarginBottom = useAnimatedValue(0);
  const animatedHeight = useAnimatedValue(0);
  const [expandButtonHeight, setExpandButtonHeight] = React.useState<number | undefined>(undefined);

  // reference values calculated before rendering
  const [collapsedCardHeight, setCollapsedCardHeight] = React.useState<number | undefined>(undefined);
  const [expandButtonWidth, setExpandButtonWidth] = React.useState<number | undefined>(undefined);
  const [expandedCardHeight, setExpandedCardHeight] = React.useState<number | undefined>(undefined);
  const [lastLineWidth, setLastLineWidth] = React.useState<number | undefined>(undefined);
  const [lineCount, setLineCount] = React.useState<number | undefined>(undefined);
  const isExpendable =
    expandedCardHeight === undefined || collapsedCardHeight === undefined
      ? undefined
      : Math.floor(expandedCardHeight) > Math.floor(collapsedCardHeight);
  // pixelRatio is used in the useLayoutEffect to react to font scaling that could be changed by the user
  const pixelRatio = PixelRatio.getFontScale();

  const [truncatedContent, setTruncatedContent] = React.useState<string | undefined>(undefined); // = text in the content prop adjusted to fit the card

  const animatedHeightStyle: ViewProps['style'] = React.useMemo(() => {
    // when expanded, we add the button height to the card height in order to display "see-less" one line below the text
    const totalHeight = expanded && expandButtonHeight ? Animated.add(animatedHeight, expandButtonHeight) : animatedHeight;
    return { height: totalHeight };
  }, [animatedHeight, expandButtonHeight, expanded]);

  const animatedMarginTopStyle: ViewProps['style'] = React.useMemo(
    () => [styles.cardContainer, { marginTop: animatedMarginTop }],
    [animatedMarginTop],
  );

  const animatedMarginBottomStyle: ViewProps['style'] = React.useMemo(
    () => ({ marginBottom: animatedMarginBottom }),
    [animatedMarginBottom],
  );

  const contentElement = React.useMemo(() => {
    return <BodyText>{expanded ? content : (truncatedContent ?? content)}</BodyText>;
  }, [content, expanded, truncatedContent]);

  // console.info(`"${content}"`, minNumberOfLines, lineCount);

  // beofre rendering, we set the size of all the elements involved in animation
  React.useLayoutEffect(() => {
    (async () => {
      const measuredFontProperties = await RNTextSize.fontFromSpecs({
        ...TEXT_FONT_SPECS,
      });
      const measuredLineHeightBase = measuredFontProperties.lineHeight + measuredFontProperties.leading;
      const lineHeightRatio = TextSizeStyle.Medium.lineHeight / measuredLineHeightBase;

      const measuredContent = await RNTextSize.measure({
        ...TEXT_FONT_SPECS,
        allowFontScaling: true,
        lineInfoForLine: 0,
        text: content,
        usePreciseWidth: true,
        width: textWidth,
      });
      const measuredLineHeight = (measuredContent.lineInfo?.bottom ?? 0) * lineHeightRatio;
      setCollapsedCardHeight(() => {
        const value = measuredLineHeight * Math.min(minNumberOfLines, measuredContent.lineCount);
        animatedHeight.setValue(value);
        return value;
      });
      setExpandedCardHeight(measuredContent.height * lineHeightRatio);
      setLastLineWidth(measuredContent.lastLineWidth!);
      setLineCount(measuredContent.lineCount);

      const measuredSeeMore = await RNTextSize.measure({
        ...TEXT_FONT_SPECS,
        allowFontScaling: true,
        text: I18n.get('text-ellipsis') + I18n.get('textpreview-seemore'),
        usePreciseWidth: true,
      });
      const expandButtonTextSpacing = styles.expandButtonText.marginHorizontal * 2;
      setExpandButtonWidth(measuredSeeMore.width + expandButtonTextSpacing + UI_SIZES.elements.icon.xsmall);
    })();
  }, [content, minNumberOfLines, textWidth, pixelRatio, animatedHeight]);

  // if the text is longer than the available space we truncate it after ensuring we will have enough width on the last line to display the ellipsis and the see-more button
  React.useLayoutEffect(() => {
    (async () => {
      if (isExpendable === undefined) return undefined;
      if (isExpendable === false) return content;
      let currentLineCount = lineCount;
      let currentLastLineWidth = lastLineWidth;
      let currentText = content;
      while (
        (currentLineCount && currentLineCount > minNumberOfLines) ||
        (currentLastLineWidth && expandButtonWidth && currentLastLineWidth > textWidth - expandButtonWidth)
      ) {
        const lastSpaceIndex = content.lastIndexOf(' ', currentText.length - 1);
        currentText = content.slice(0, lastSpaceIndex);
        const currentMeasuredContent = await RNTextSize.measure({
          ...TEXT_FONT_SPECS,
          allowFontScaling: true,
          text: currentText,
          usePreciseWidth: true,
          width: textWidth,
        });
        currentLineCount = currentMeasuredContent.lineCount;
        currentLastLineWidth = currentMeasuredContent.lastLineWidth;
      }
      setTruncatedContent(currentText + I18n.get('text-ellipsis'));
    })();
  }, [content, isExpendable, lastLineWidth, lineCount, minNumberOfLines, expandButtonWidth, textWidth]);

  const animateCard = React.useCallback(
    (isExpanding: ResourceDescriptionProps['expanded']) => {
      if (!isExpendable || collapsedCardHeight === undefined || expandedCardHeight === undefined) return;
      Animated.parallel([
        Animated.timing(animatedHeight, {
          ...ANIMATION_CONFIG,
          toValue: isExpanding ? expandedCardHeight : collapsedCardHeight,
        }),
        Animated.timing(animatedMarginTop, {
          ...ANIMATION_CONFIG,
          toValue: isExpanding ? CARD_EXPANDED_MARGIN_TOP : CARD_UNEXPANDED_MARGIN_TOP,
        }),
        Animated.timing(animatedMarginBottom, {
          ...ANIMATION_CONFIG,
          toValue: isExpanding ? CARD_EXPANDED_MARGIN_BOTTOM : 0,
        }),
      ]).start();
    },
    [isExpendable, collapsedCardHeight, expandedCardHeight, animatedHeight, animatedMarginTop, animatedMarginBottom],
  );

  const toggleCardAnimation = React.useCallback(() => {
    onToggleVisibility?.(!expanded);
    animateCard(!expanded);
  }, [animateCard, expanded, onToggleVisibility]);

  return (
    <Animated.View style={[animatedMarginTopStyle, animatedMarginBottomStyle]}>
      <TouchableOpacity onPress={toggleCardAnimation}>
        <Animated.View style={animatedHeightStyle}>
          {contentElement}
          {isExpendable && <ExpandButton isExpanded={expanded} onButtonLayout={setExpandButtonHeight} />}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ResourceDescription;
